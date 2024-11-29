import {userController} from '../../interface/controllers/userController';
import RabbitMQClient from './client';


export default class MessageHandlers{
     static async handle(operations:string,data : any, correlationId:string,replyTo:string){
        let response
        switch(operations){
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
            case 'update-my-course' :
                console.log('Handling operation',operations,data)
                response = await userController.addMyCourse(data)
                console.log("data reached in adminisblock ",response);
                break;
            case 'user-my-course' :
                console.log('Handling operation',operations,data)
                response = await userController.userMyCourses(data)
                console.log("data reached in adminisblock ",response);
                break;
            case 'chat-user-data' :
                console.log('Handling operation',operations,data)
                response = await userController.chatUsers(data)
                console.log("data reached in adminisblock ",response);
                break;
            case 'tutor-user-details' :
                console.log('Handling operation',operations,data)
                response = await userController.tutorStudentsData(data)
                console.log("data reached in adminisblock ",response);
                break;
            case 'fetch-sender-data' :
                console.log('Handling operation',operations,data)
                response = await userController.chatSenderData(data)
                console.log("data reached in adminisblock ",response);
                break;
            case 'fetch-group-users' :
                console.log('Handling operation',operations,data)
                response = await userController.fetchGroupMembers(data)
                console.log("data reached in adminisblock ",response);
                break;
            case 'admin-payout-user' :
                console.log('Handling operation',operations,data)
                response = await userController.payoutUsers(data)
                console.log("data reached in adminisblock ",response);
                break;
            case 'admin-total-users' :
                console.log('Handling operation',operations)
                response = await userController.totalUsers()
                console.log("data reached in adminisblock ",response);
                break;
            case 'user-myCourse' :
                console.log('Handling operation',operations)
                response = await userController.userMyCourse(data)
                console.log("data reached in adminisblock ",response);
                break;
        }

        await RabbitMQClient.produce(response,correlationId,replyTo)
     }
}





