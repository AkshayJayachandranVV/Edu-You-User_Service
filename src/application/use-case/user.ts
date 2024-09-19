import { UserRepository } from "../../domain/repositories/UserRepository";
import { IUser, LoginUser, tempId,userMinData,userData,profile, Email } from "../../domain/entities/IUser";
import { generateOtp } from "../../utils/generateOtp";
import { sendOtpEmail } from "../../utils/sendEmail";
import { TemporaryUser } from "../../model/TempUser";
import { OAuth2Client } from 'google-auth-library'
import config from "../../infrastructure/config/config";
import { fetchFileFromS3, uploadFileToS3 } from "../../infrastructure/s3/s3Action";
import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async registerUser(userData: IUser): Promise<any> {
    try {
      console.log("reached user.ts in usecase");
      const UserExist = await this.userRepo.findByEmail(userData.email);
      console.log("user found", UserExist);
      if (UserExist) {
        return { success: false, message: "Email already registered" };
      } else {
        const otp = generateOtp();
        console.log("generated OTP", otp);
        const forgotPass: boolean = false;
        await sendOtpEmail(userData.email, otp);
        const temporaryUser = new TemporaryUser({
          otp: otp,
          userData: userData,
          createdAt: Date.now(),
        });
        await temporaryUser.save();

        if (temporaryUser) {
          const tempId = temporaryUser._id.toString(); // Convert ObjectId to string if needed
          return {
            message: "Verify the otp to complete registeration",
            forgotPass,
            success: true,
            userData,
            tempId,
          };
          // return { success: true, message: "Verification email sent", tempId, email};
        } else {
          throw new Error("Failed to create temporary user data.");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error saving user:${error.message}`);
      }
      throw error;
    }
  }

  async verifyOtp(otpObj: any): Promise<any> {
    try {
      const { otp, id } = otpObj;
      console.log(otp, id);
      console.log("Verifying OTP", otp);
      const temporaryUser = await this.userRepo.findTempUser(id);

      console.log(temporaryUser, " checvking its validity");

      if (!temporaryUser) {
        return { success: false, message: "Invalid OTP" };
      }

      if(otp !== temporaryUser.otp){
        console.log("enetered to invalid otp")
        return {
            success: false,
            message: "Incorrect Otp",
          };
      }

      const userData = temporaryUser.userData;

      if (!userData) {
        return {
          success: false,
          message: "User data is missing in the temporary record",
        };
      }

      const savedUser = await this.userRepo.save(userData);

      return {
        message: "User data saved successfully",
        success: true,
        user_data: savedUser,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error saving user:${error.message}`);
      }
      throw error;
    }
  }

  async loginUser(data: LoginUser): Promise<{ success: boolean; message: string; userData?: userData; role?: string }> {
    try {
      const { email, password } = data;
  
      const userData = await this.userRepo.checkUser(email, password);
  
      console.log(userData, "data changed code to userepo to testcase");
  
      if (!userData) {
        return { success: false, message: "Email incorrect" };
      }


      if(userData.isBlocked){
        return { success: false, message: "User is Blocked" };
      }
  
      // Extract the stored password from userData
      const storedPassword = userData.password;
  
      console.log(storedPassword, "stored password in userData.ts im userapplication");
  
      if (!storedPassword) {
        return { success: false, message: "Password not found for user" };
      }
  
      const isPassword = await bcrypt.compare(password, storedPassword);
  
      console.log(isPassword);
  
      if (!isPassword) {
        console.log("password unmatched");
        return { success: false, message: "Incorrect Password" };
      } else {
        console.log("successfully logged in", userData);
  
        // Remove the password from userData before returning
        const { password, ...userDataWithoutPassword } = userData;
  
        return {
          success: true,
          message: "Login successful",
          userData: userDataWithoutPassword, // Send user data without password
          role: "user",
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error logging in user: ${error.message}`);
      }
      throw error;
    }
  }
  

  async resendOtp(data: tempId): Promise<{ success: boolean; forgotPass?: boolean, message: string; userData?: IUser , id?: mongoose.Types.ObjectId  }> {
    try {
      console.log("Resend otp has entered", data);

      const tempId = data.id;

      const result = await this.userRepo.findTempUser(tempId);

      console.log(result, "result of the resendotp");

  
      if(!result){
             return { success: false, message: " Temporary Userdata not found" };

      }

      if(!result.userData){
      
        return { success: false, message: " Userdata not found" };
        }
            let userData = result.userData
            const otp = generateOtp();

            const forgotPass: boolean = false;
            await sendOtpEmail(result.userData.email, otp);

            const updateOtp = await this.userRepo.updateOtp(tempId,otp);

            return {
                message: "Verify the otp to complete registeration",
                forgotPass,
                success: true,
                userData,
                id: new mongoose.Types.ObjectId(tempId),
              };

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error saving user:${error.message}`);
      }
      throw error;
    }
  }


  async forgotPassword(email: string): Promise<{ forgotPass?: boolean, user?:userMinData , success: boolean, message: string, tempId?: string }>{
        try {
            console.log("Forgot Passowrd has entered", email);

            const user = await this.userRepo.findByEmail(email);
            console.log('kkkkkkkkkkkkk', user)

            if(user){
                const forgotPass: boolean = true; 

                const otp = generateOtp();

                console.log(otp,"Gpot the OT[P---")

                const tempData = new TemporaryUser({
                    otp: otp,
                    userData: user,
                    createdAt: new Date()
                })

                await tempData.save()

                console.log(tempData, " ------" )

                await sendOtpEmail(email,otp)

                const userData = {
                    email : user.email,
                    username : user.username
                }

                const tempId = tempData._id.toString(); 

                return { forgotPass:forgotPass, user:userData , success: true, message: "Found user with this email" ,tempId :tempId}
            }else{
                return { success: false, message: "No user found with this email" };
            }

            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error saving user:${error.message}`);
              }
              throw error;
        }
  }


     async forgotOtpVerify(otpObj: any): Promise<any> {

        try {

          const { otp, id } = otpObj;
          console.log(otp, id);
          console.log("Verifying OTP", otp);
          const temporaryUser = await this.userRepo.findTempUser(id);
    
          console.log(temporaryUser, " checvking its validity");
    
          if (!temporaryUser) {
            return { success: false, message: "Invalid OTP" };
          }
    
          if(otp !== temporaryUser.otp){
            console.log("enetered to invalid otp")
            return {
                success: false,
                message: "Incorrect Otp",
              };
          }
    
          return {
            message: "User data saved successfully",
            success: true,
          };
          
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Error saving user:${error.message}`);
          }
          throw error;
        }

     }


    async resetPassword(data: any): Promise<any> {
        try {
            const {newPassword,email} = data;
            console.log("eneterd to reset . ",newPassword,email)
            const UserExist = await this.userRepo.findByEmail(email);

            if(!UserExist){
              return { success: false, message: "User Does not Exist" };
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10)
            console.log('hashed password', hashedPassword);

            const updatePassword = await this.userRepo.updatePassword(email,hashedPassword);

            console.log(updatePassword)

            if(!updatePassword){
              return { success: false, message: "Password not updated" };
            }

            return { success: true, message: "succesfully updated password" };

        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Error saving user:${error.message}`);
          }
          throw error;
        }
    }

    async googleLoginUser(data: any): Promise<any> {
      try {
          const email = data.email;
          const username = data.fullname;
          let user = await this.userRepo.findByEmail(email);
          if (!user) {
              user = await this.userRepo.googleSave({
                  email,
                  username,
                  password: 'defaultpassword',
              } as IUser)
          }
          console.log(user.isBlocked);
          if (user.isBlocked) {
              console.log('isblocked----------------if')
              return { success: false, message:"User is Blocked", user_data: user };
          } else {
              console.log('isblocked----------------else')
              return { success: true, message: 'Logged in successful', user_data: user };
          }



      } catch (error) {
          if (error instanceof Error) {
              throw new Error(`Error logging in with Google: ${error.message}`);
          }
          throw error;
      }
  }


async editProfile(data: profile): Promise<any> {
    try {
        console.log(data, "data in edit profile");
        let profile_pic_url: string = '';

        // Ensure profile_picture is a file object with a buffer
        if (data.image && typeof data.image !== 'string' && 'buffer' in data.image) {
            const buffer = Buffer.isBuffer(data.image.buffer) 
                ? data.image.buffer 
                : Buffer.from(data.image.buffer);

            // Upload the image buffer to S3 and get the key
            const key = await uploadFileToS3(buffer, data.image.originalname);
            data.image = key;  // Update the image field with the S3 key

            // Fetch the URL of the uploaded image from S3 (with expiry time)
            profile_pic_url = await fetchFileFromS3(key, 604800); // URL valid for 7 days
        }

        console.log(profile_pic_url, 'Profile picture URL after upload');

        // Extract relevant fields from `data.data`
        const { username, email, phone, about } = data.data;

        console.log(username, email, phone, about);

        // Update the user profile with the provided data (image is now the S3 key)
        let user = await this.userRepo.editProfile({ username, email, phone, about, image: data.image });

        console.log("Check value updated or not", user);

        // Update the profile_picture field with the new profile_pic_url before sending to frontend
        const updatedUser = { ...user, profile_picture: profile_pic_url };

        return updatedUser; // Send updated user data with the profile_picture URL

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error editing profile: ${error.message}`);
        }
        throw error;
    }
}



async totalStudents(data: any): Promise<IUser[]| null> {
  try {
      console.log(data, "data in students list");
      
      const students = await this.userRepo.totalStudents();
      return students;

  } catch (error) {
      if (error instanceof Error) {
          throw new Error(`Error editing profile: ${error.message}`);
      }
      throw error;
  }
}


async isBlocked(data: Email): Promise<any> {
  try {
      console.log(data, "data in students list");
      const {email} = data
      
      const isBlocked = await this.userRepo.isBlocked(email);
      return isBlocked;

  } catch (error) {
      if (error instanceof Error) {
          throw new Error(`Error editing profile: ${error.message}`);
      }
      throw error;
  }
}


 }


 

  

  


