import {UserService} from "../../application/use-case/user"
import { LoginUser,tempId, Email,userData } from "../../domain/entities/IUser";
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import bcrypt from 'bcrypt';



class UserController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    async registerUser(data: any){
        try{
            console.log(data, "register user");
            const result = await this.userService.registerUser(data);
            console.log("result of register", result);
            return result;
        }catch(error){
            console.log("error in register user usercontroller", error);
        }
    }

    async verifyOtp(data:any){
        try{
            console.log(data,"verify_otp")

            const result = await this.userService.verifyOtp(data)
            console.log("result of verify-otp", result);
            return result;

        }catch(error){
            console.log("error in verifyotp user usercontroller", error);
        }
    }

    async loginUser(call: any, callback: any) {
        try {
            console.log("reached-------------------------------------------")
            const { email, password } = call.request;
            const result = await this.userService.loginUser(email, password);
            callback(null, result);
        } catch (error) {
            console.log(error,"in grpc") 
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


    async googleLoginUser(data: any){
        try{
            console.log(data, "login user");

            const result = await this.userService.googleLoginUser(data)

            return result
        }catch(error){
            console.log("error in login user usercontroller", error);
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

}





export const userController = new UserController()

