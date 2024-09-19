import {IUserRepository} from './IUserRepository';
import {IUser, userData} from '../entities/IUser'
import {ITemporaryUser,TemporaryUserData} from '../entities/IUser'
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { User } from "../../model/User";
import {TemporaryUser} from '../../model/TempUser'
import { bool } from 'aws-sdk/clients/redshiftdata';

export class UserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        try{
            console.log('reachd userRepository findByEmail',email);
            const user = await User.findOne({email:email}).exec()
            return user
        }catch(error){
            const err = error as Error;
            throw new Error(`Error finding user by email ${err.message} `)
        }
    }

    async findTempUser(tempId: string): Promise<ITemporaryUser | null> {
        try {
            console.log('reached userRepository findTempOtp', tempId);

            const temporaryUser = await TemporaryUser.findOne({ _id: tempId }).exec();


    
            if (!temporaryUser) {
                return null;
            }
            
            return temporaryUser as ITemporaryUser;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error finding temporary user by tempId ${err.message}`);
        }
    }

    async save(user: IUser): Promise<IUser> {
        try {
            console.log('save user in userrepository reached');
            
            // Hash the user's password
            const hashedPassword = await bcrypt.hash(user.password, 10);
            console.log('hashed password', hashedPassword);
    
            // Add isBlocked: false to the userData object before saving
            const userData = {
                ...user,
                password: hashedPassword,
                isBlocked: false // Adding the isBlocked field
            };
    
            console.log("finaldata--", userData);
    
            // Create a new User instance with the updated userData
            const newUser = new User(userData);
    
            // Save the new user to the database
            await newUser.save();
    
            return newUser;
            
        } catch (error) {
            console.log("error in save userRepo");
            const err = error as Error;
            throw new Error(`Error saving user: ${err.message}`);
        }
    }
    


    async checkUser(email : string, password : string): Promise< IUser | null >{
          try {
                console.log('login user in userrepository reached')
                const userData = await User.findOne({email : email}) 

                console.log(userData)

             return userData

          } catch (error) {
            console.log("error in save userRepo")
            const err = error as Error;
            throw new Error(`Error logging check user ${err.message}`);
          }
    }

    async updateOtp(tempId: string, otp : string): Promise<ITemporaryUser | null> {
        try {
            console.log("enetered updateOtp",tempId)

            const updateTemporaryUser = await TemporaryUser.updateOne({ _id: tempId },{$set:{otp :otp}}).exec();

            console.log(updateTemporaryUser, " updated tempuser AFTER RESEND OTP ----")
  
            const temporaryUser = await TemporaryUser.findOne({ _id: tempId }).exec();

            console.log(temporaryUser)

            if (!temporaryUser) {    
                return null;
            }

            return temporaryUser as ITemporaryUser
            
            
        } catch (error) {
            console.log("error in save userRepo")
            const err = error as Error;
            throw new Error(`Error logging check user ${err.message}`);
        }
    }


    async updatePassword(email : string, hashedPassword : string): Promise< IUser | null >{
        try {
              console.log('login user in userrepository reached')
              const updateData = await User.updateOne(
                { email: email },
                { $set: { password: hashedPassword } }
            );
    

              console.log(updateData)

              const userData = await User.findOne({email : email}) 

           return userData

        } catch (error) {
          console.log("error in save userRepo")
          const err = error as Error;
          throw new Error(`Error logging check user ${err.message}`);
        }
  }

  async googleSave(user: IUser): Promise<IUser> {
    try {
        console.log('save user in userrepository reached');
        
        // Add isBlocked: false to the userData object before saving
        const userData = {
            ...user,
            isBlocked: false // Adding the isBlocked field
        };

        console.log("finaldata--", userData);

        // Create a new User instance with the updated userData
        const newUser = new User(userData);

        // Save the new user to the database
        await newUser.save();

        return newUser;
        
    } catch (error) {
        console.log("error in save userRepo");
        const err = error as Error;
        throw new Error(`Error saving user: ${err.message}`);
    }
}


async editProfile(user: userData) : Promise<IUser| null> {
    try {
        console.log('edit profile  in userrepository reached')

        const {username,email,phone,about, image} = user;
      
        let updateProfile = await User.updateOne({ email : email },{$set:{username,phone,about,profile_picture:image}}).exec();

        console.log(updateProfile)

        const userData = await User.findOne({ email: email }).select('-password');


        console.log(userData)

        return userData
        
    } catch (error) {
        console.log("error in save userRepo")
        const err = error as Error;
        throw new Error(`Error finding temporary user by tempId ${err.message}`);
        
    }
}



async totalStudents() : Promise<IUser[]| null> {
    try {
        console.log(' total students  in userrepository reached')

      
        let studentsData = await User.find({}).exec();

        console.log(studentsData)

        return studentsData
        
    } catch (error) {
        console.log("error in save userRepo")
        const err = error as Error;
        throw new Error(`Error finding temporary user by tempId ${err.message}`);
        
    }
}


async isBlocked(email: string): Promise<{ success: boolean; message: string }> {
    try {
        console.log('Total students in userrepository reached', email);

        // Find the user by email
        const userData = await User.findOne({ email: email });

        // If no user is found
        if (!userData) {
            return { success: false, message: 'User not found' };
        }

        console.log(userData, "Got user data for isBlocked");

        // Toggle the isBlocked status
        const isBlocked = !userData.isBlocked;

        // Update the user with the new isBlocked status
        await User.updateOne({ email: email }, { $set: { isBlocked: isBlocked } });

        // Return success message based on the new status
        return {
            success: true,
            message: isBlocked ? "Successfully blocked the user" : "Successfully unblocked the user"
        };

    } catch (error) {
        console.log("Error in isBlocked function");
        const err = error as Error;
        return { success: false, message: `Error updating user status: ${err.message}` };
    }
}


    
}

