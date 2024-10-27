import {UserService} from "../../application/use-case/user"
import { LoginUser,tempId, Email,userData } from "../../domain/entities/IUser";
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import bcrypt from 'bcrypt';
import * as grpc from '@grpc/grpc-js';



class UserController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    async registerUser(call: any, callback: any): Promise<void> {
        try {
            console.log("Reached registerUser method", call.request);
    
            // Extract user data from gRPC request
            const userData = call.request;
    
            // Call the userService's registerUser method, passing the user data
            const result = await this.userService.registerUser(userData);
    
            console.log("Result of register", result);
    
            // Check the result and call the callback with appropriate response
            if (result && result.success) {
                return callback(null, {
                    success: true,
                    message: result.message || 'Registration successful. Verify the OTP to complete registration.',
                    userData: result.userData,
                    tempId: result.tempId, // Assuming tempId is returned for OTP verification
                });
            } else {
                return callback(null, {
                    success: false,
                    message: result.message || 'Registration failed. Please try again.',
                });
            }
        } catch (error) {
            console.log("Error in registerUser method:", error);
    
            // Return an error in case something goes wrong
            return callback({
                code: grpc.status.INTERNAL,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    }
    
    

    async verifyOtp(call: any, callback: any): Promise<void> {
        try {
            console.log("Received gRPC verifyOtp request", call.request);
    
            // Extract otp and id from gRPC request
            const { otp, id } = call.request;
    
            // Call the userService's verifyOtp method, passing otp, id, and handling callback
            const result = await this.userService.verifyOtp({ otp, id });
            console.log("Result of verify-otp:", result);
    
            // Check if OTP verification was successful and return the result via callback
            if (result && result.success) {
                return callback(null, {
                    success: true,
                    message: "OTP verified. User registered successfully",
                    user_data: result.user_data, // Include user data if needed
                });
            } else {
                // Handle incorrect OTP case or other failures
                if (result.message === "Incorrect Otp") {
                    return callback(null, {
                        success: false,
                        message: "Incorrect OTP",
                    });
                } else {
                    return callback(null, {
                        success: false,
                        message: "User registration failed. Please try again.",
                    });
                }
            }
        } catch (error) {
            console.error("Error in verifyOtp gRPC method", error);
    
            // Return an error in case something goes wrong
            return callback({
                code: grpc.status.INTERNAL,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    }
    

    // async loginUser(data:any) {
    //     try {
    //         console.log("reached-------------------------------------------")
    //         const { email, password } = data;
    //         const result = await this.userService.loginUser(data);
    //         return result
    //     } catch (error) {
    //         console.log(error,"in grpc") 
    //     }
    // }


    async loginUser(call: any, callback: any): Promise<void> {
        try {
          console.log("reached-------------------------------------------",call.request);
      
          // Extract email and password from gRPC request
          const { email, password } = call.request;
      
          // Call the userService's loginUser method, passing both email, password, and callback
          await this.userService.loginUser({ email, password }, callback);
        } catch (error) {
          console.log(error, "in grpc");
      
          // Return an error in case something goes wrong
          return callback({
            code: grpc.status.INTERNAL,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
      }

      async googleLoginUser(call: any, callback: any): Promise<void> {
        try {
            console.log("Reached googleLoginUser gRPC handler", call.request);
    
            // Extract email and fullname from gRPC request
            const { email, fullname } = call.request;
    
            // Call the userService's googleLoginUser method
            const result = await this.userService.googleLoginUser({ email, fullname });
    
            // Send the result back using callback
            return callback(null, result); // result should match the structure of GoogleLoginUserResponse
        } catch (error) {
            console.log("Error in googleLoginUser gRPC handler", error);
    
            // Return an error in case something goes wrong
            return callback({
                code: grpc.status.INTERNAL,
                message: error instanceof Error ? error.message : 'Unknown error occurred',          
            });
        }
    }
      
    


    async resendOtp(data :tempId ){
        try {
            console.log(data, "resend otp");
            const result = await this.userService.resendOtp(data)

            console.log(result, "of the resendOtp")
            return result
        } catch (error) {
            console.log("error in resend otp in usercontroller", error);
        }
    }

    async forgotPassword(data :any ){
        try {
            console.log(data, "resend otp");
            const result = await this.userService.forgotPassword(data.email)

            console.log(result, "of the resendOtp")
            return result
        } catch (error) {
            console.log("error in resend otp in usercontroller", error);
        }
    }


    async forgotOtpVerify(data :Email ){
        try {
            console.log(data,"forgotttt-verify_otp")

            const result = await this.userService.forgotOtpVerify(data)
            console.log("result of verify-otp", result);
            return result;
        } catch (error) {
            console.log("error in resend otp in usercontroller", error);
        }
    }


    async resetPassword(data :Email ){
        try {
            console.log(data,"forgotttt-verify_otp")

            const result = await this.userService.resetPassword(data)
            console.log("result of verify-otp", result);
            return result;
        } catch (error) {
            console.log("error in resend otp in usercontroller", error);
        }
    }


  
    


    async editProfile(data: any){
        try{
            console.log(data, "user edit profile");

            const result = await this.userService.editProfile(data)

            return result
        }catch(error){
            console.log("error in login user usercontroller", error);
        }

    }

    
    async totalStudents(data: any){
        try{
            console.log(data, "user edit profile");

            const result = await this.userService.totalStudents(data)

            return result
        }catch(error){
            console.log("error in login user usercontroller", error);
        }

    }
   

    async isBlocked(data: any){
        try{
            console.log(data, "admin isBLocked");

            const result = await this.userService.isBlocked(data)

            return result
        }catch(error){
            console.log("error in login user usercontroller", error);
        }

    }


    async addMyCourse(data: any){
        try{
            console.log(data, "add course my course");

            const result = await this.userService.addMyCourse(data)

            return result
        }catch(error){
            console.log("error in login user usercontroller", error);
        }

    }

    async userMyCourses(data: any){
        try{
            console.log(data, "add course my course");

            const result = await this.userService.userMyCourses(data)

            return result
        }catch(error){
            console.log("error in login user usercontroller", error);
        }

    }


    async chatUsers(data: any){
        try{
            console.log(data, "add course my course");

            const result = await this.userService.chatUsers(data)

            return result
        }catch(error){
            console.log("error in login user usercontroller", error);
        }

    }


    async tutorStudentsData(data: any){
        try{
            console.log(data, "add course my course");

            const result = await this.userService.tutorStudentsData(data)

            return result
        }catch(error){
            console.log("error in login user usercontroller", error);
        }

    }

}





export const userController = new UserController()

