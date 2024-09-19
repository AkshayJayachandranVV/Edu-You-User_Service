import {userController} from '../../interface/controllers/userController';
import RabbitMQClient from './client';


export default class MessageHandlers{
     static async handle(operations:string,data : any, correlationId:string,replyTo:string){
        let response
        switch(operations){
            case 'register_user':
                console.log('Handling operation',operations,data);
                response = await userController.registerUser(data)
                console.log("data reached inside message handler.ts",response);
                break;
            case 'verify_otp' : 
                console.log('Handling operation',operations,data)
                response = await userController.verifyOtp(data)
                console.log("data reached inside message handler.ts",response);
                break;
            case 'login_user' :
                console.log('Handling operation',operations,data);
                response = await userController.loginUser(data)
                console.log("data reached ",response);
                break;
            case 'resend_otp' :
                console.log('Handling operation',operations,data)
                response = await userController.resendOtp(data)
                console.log("data reached ",response);
                break;
            case 'forgot-password' :
                console.log('Handling operation',operations,data)
                response = await userController.forgotPassword(data)
                console.log("data reached ",response);
                break;
            case 'forgot-otp-verify' :
                console.log('Handling operation',operations,data)
                response = await userController.forgotOtpVerify(data)
                console.log("data reached ",response);
                break;
            case 'reset-password' :
                console.log('Handling operation',operations,data)
                response = await userController.resetPassword(data)
                console.log("data reached ",response);
                break;
            case 'google-login_user' :
                console.log('Handling operation',operations,data)
                response = await userController.googleLoginUser(data)
                console.log("data reached ",response);
                break;
            case 'edit_profile' :
                console.log('Handling operation',operations,data)
                response = await userController.editProfile(data)
                console.log("data reached ",response);
                break;
            case 'admin-students' :
                console.log('Handling operation',operations,data)
                response = await userController.totalStudents(data)
                console.log("data reached ",response);
                break;
            case 'admin-isBlocked' :
                console.log('Handling operation',operations,data)
                response = await userController.isBlocked(data)
                console.log("data reached in adminisblock ",response);
                break;
        }

        await RabbitMQClient.produce(response,correlationId,replyTo)
     }
}





