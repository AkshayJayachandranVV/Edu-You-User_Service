import { UserRepository } from "../../domain/repositories/UserRepository";
import { IUser, LoginUser, tempId,userMinData,userData,profile, Email } from "../../domain/entities/IUser";
import { generateOtp } from "../../utils/generateOtp";
import { sendOtpEmail } from "../../utils/sendEmail";
import { TemporaryUser } from "../../model/TempUser";
import { OAuth2Client } from 'google-auth-library'
import config from "../../infrastructure/config/config";
import { fetchFileFromS3, uploadFileToS3 } from "../../infrastructure/s3/s3Action";
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";
import { handleUnaryCall } from "@grpc/grpc-js";
import * as grpc from '@grpc/grpc-js'; 

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }


  async registerUser(userData: IUser): Promise<any> {
    try {
        console.log("Reached user.ts in use case");

        // Check if user already exists
        const userExist = await this.userRepo.findByEmail(userData.email);
        console.log("User found", userExist);

        if (userExist) {
            return { success: false, message: "Email already registered" };
        } else {
            // Generate OTP
            const otp = generateOtp();
            console.log("Generated OTP", otp);

            // Send OTP email
            await sendOtpEmail(userData.email, otp);

            // Create a temporary user entry
            const temporaryUser = new TemporaryUser({
                otp: otp,
                userData: userData,
                createdAt: Date.now(),
            });

            await temporaryUser.save();

            if (temporaryUser) {
                const tempId = temporaryUser._id.toString(); // Convert ObjectId to string if needed
                return {
                    success: true,
                    message: "Verify the OTP to complete registration",
                    userData: userData, // Include user data to return
                    tempId: tempId, // Include tempId for OTP verification
                };
            } else {
                throw new Error("Failed to create temporary user data.");
            }
        }
    } catch (error) {
        console.error("Error saving user:", error);
        if (error instanceof Error) {
            throw new Error(`Error saving user: ${error.message}`);
        }
        throw error; // Rethrow other types of errors
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

  
//   async loginUser(data: any): Promise<{ success: boolean; message: string; userData?: any; role?: string }> {
//     try {
//         const { email, password } = data; // Get the email and password from the request

//         // Check if user exists
//         const userData: any = await this.userRepo.checkUser(email, password);
//         console.log(userData, "data retrieved from userRepo");

//         if (!userData) {
//             return { success: false, message: "Email incorrect" };
//         }

//         // Check if the user is blocked
//         if (userData.isBlocked) {
//             return { success: false, message: "User is blocked" };
//         }

//         const storedPassword: string | undefined = userData.password; // Explicitly define type
//         console.log(storedPassword, "stored password in userData");

//         if (!storedPassword) {
//             return { success: false, message: "Password not found for user" };
//         }

//         // Compare the provided password with the stored hash
//         const isPasswordMatch = await bcrypt.compare(password, storedPassword);
//         if (!isPasswordMatch) {
//             console.log("Password unmatched");
//             return { success: false, message: "Incorrect Password" };
//         }

//         console.log("Successfully logged in", userData);

//         // Exclude sensitive data before returning if needed
//         const { password: _, ...userDataWithoutPassword } = userData;

//         return {
//             success: true,
//             message: "Login successful",
//             userData: userDataWithoutPassword, // Send user data without password
//             role: "user",
//         };
//     } catch (error) {
//         if (error instanceof Error) {
//             throw new Error(`Error logging in user: ${error.message}`);
//         }
//         throw error;
//     }
// };

async loginUser({ email, password }: { email: string, password: string }, callback: any): Promise<void> {
  try {
    // Check if user exists
    const userData: any = await this.userRepo.checkUser(email, password);
    console.log(userData, "data retrieved from userRepo");

    if (!userData) {
      return callback(null, {
        success: false,
        message: "Email incorrect"
      });
    }

    if (userData.isBlocked) {
      return callback(null, {
        success: false,
        message: "User is blocked"
      });
    }

    const storedPassword: string | undefined = userData.password;
    if (!storedPassword) {
      return callback(null, {
        success: false,
        message: "Password not found for user"
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    if (!isPasswordMatch) {
      return callback(null, {
        success: false,
        message: "Incorrect Password"
      });
    }

    // Transform userData into the structure expected by the proto definition
    const userDataResponse = {
      id: userData._id.toString(),        // Convert MongoDB ObjectId to string
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      profile_picture: userData.profile_picture,
      about: userData.about,
      createdAt: userData.createdAt.toISOString(),
      myCourse: userData.myCourse.map((course: any) => ({
        courseId: course.courseId.toString(),  // Convert ObjectId to string
        date: course.date.toISOString()        // Convert Date to ISO string
      }))
    };

    // Debugging log before callback
    console.log("Returning response:", {
      success: true,
      message: "Login successful",
      role: "user",
      userData: userDataResponse
    });

    // Return success response
    return callback(null, {
      success: true,
      message: "Login successful",
      role: "user",
      userData: userDataResponse  // The transformed user data
    });
  } catch (error) {
    console.error("Error logging in user:", error);

    // Handle error and return internal error response
    return callback({
      code: grpc.status.INTERNAL,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
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
          return { success: false, message:"User is Blocked", user_data: user,role: "user",};
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

  //    async googleLoginUser(data: any): Promise<any> {
  //     try {
  //         const email = data.email;
  //         const username = data.fullname;
  //         let user = await this.userRepo.findByEmail(email);
  //         if (!user) {
  //             user = await this.userRepo.googleSave({
  //                 email,
  //                 username,
  //                 password: 'defaultpassword',
  //             } as IUser)
  //         }
  //         console.log(user.isBlocked);
  //         if (user.isBlocked) {
  //             console.log('isblocked----------------if')
  //             return { success: false, message:"User is Blocked", user_data: user,role: "user",};
  //         } else {
  //             console.log('isblocked----------------else')
  //             return { success: true, message: 'Logged in successful', user_data: user };
  //         }



  //     } catch (error) {
  //         if (error instanceof Error) {
  //             throw new Error(`Error logging in with Google: ${error.message}`);
  //         }
  //         throw error;
  //     }
  // }


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



async editProfile(data: profile): Promise<any> {
    try {
        console.log(data, "data in edit profile");
        let profile_pic_url: string = '';

        // Ensure profile_picture is a file object with a buffer
        if (data.data.profile_picture && typeof data.data.profile_picture !== 'string' && 'buffer' in data.data.profile_picture) {
            const buffer = Buffer.isBuffer(data.data.profile_picture.buffer) 
                ? data.data.profile_picture.buffer 
                : Buffer.from(data.data.profile_picture.buffer);

            // Upload the image buffer to S3 and get the key
            // const key = await uploadFileToS3(buffer, data.image.originalname);
            // data.image = key;  // Update the image field with the S3 key

            // Fetch the URL of the uploaded image from S3 (with expiry time)
            // profile_pic_url = await fetchFileFromS3(key, 604800);
        }

        console.log(profile_pic_url, 'Profile picture URL after upload');

        // Extract relevant fields from `data.data`
        const { username, email, phone, about,profile_picture} = data.data;

        console.log(username, email, phone, about,profile_picture);

        // Update the user profile with the provided data (image is now the S3 key)
        let user = await this.userRepo.editProfile({ username, email, phone, about, image: profile_picture });

        console.log("Check value updated or not", user);

        // Update the profile_picture field with the new profile_pic_url before sending to frontend
        // const updatedUser = { ...user, profile_picture: profile_pic_url };

        return user; // Send updated user data with the profile_picture URL

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



async addMyCourse(data: any): Promise<any> {
  try {
      console.log(data, "data in my course add ");
      
      const mycourse = await this.userRepo.addMyCourse(data);
      return mycourse;

  } catch (error) {
      if (error instanceof Error) {
          throw new Error(`Error editing profile: ${error.message}`);  
      }
      throw error;
  }
}


async userMyCourses(data: any): Promise<any> {
  try {
      console.log(data, "data in my course add ");
      
      const mycourse = await this.userRepo.userMyCourses(data);
      return mycourse;

  } catch (error) {
      if (error instanceof Error) {
          throw new Error(`Error editing profile: ${error.message}`);  
      }
      throw error;
  }
}


async chatUsers(data: any): Promise<any> {
  try {
      console.log(data, "data in my course add ");
      
      const mycourse = await this.userRepo.chatUsers(data);
      return mycourse;

  } catch (error) {
      if (error instanceof Error) {
          throw new Error(`Error editing profile: ${error.message}`);  
      }
      throw error;
  }
}




async tutorStudentsData(data: any): Promise<any> {
  try {
      console.log(data, "data in my course add ");
      
      const studentsData = await this.userRepo.tutorStudentsData(data);
      return {success:true,students:studentsData};

  } catch (error) {
      if (error instanceof Error) {
          throw new Error(`Error editing profile: ${error.message}`);  
      }
      throw error;
  }
}

 }


 
 
 


 


