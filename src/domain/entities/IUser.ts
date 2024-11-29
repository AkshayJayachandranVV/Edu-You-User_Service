import mongoose, {Document} from "mongoose";


export interface MyCourseRequest {
    userId: string;
  }

export interface MyCoursesResponse {
    success: boolean;
    courses: MyCourse[];
  }
  
  interface MyCourse {
    courseId: string;
  }
  
  

export interface IUser {
    username: string;
    email: string;
    phone: string;
    password: string;
    about?: string;
    profile_picture?: string;
    created_At?: Date;
    isBlocked?:boolean;
  }


  export interface profile {   
    data: { // Add this block
        username: string;
        email: string;
        phone: string;
        about?: string;
        profile_picture?: { buffer: Buffer; originalname: string } | string;
    };
    created_At?: Date;
}





  export interface userData {
    username: string;
    email: string;
    phone: string | number;
    about?:string;
    created_At?: Date;
    image?: { buffer: Buffer; originalname: string } | string;
    isBlocked?:boolean;
    // profile_pic?: string;
  }


export interface ITemporaryUser extends Document {
    otp: string;
    userData: IUser;
    createdAt: Date;  // Consistent naming with Mongoose convention
}


export interface LoginUser{
    email : string;
    password : string;
}

export interface tempId{
    id : string;
}

export interface Email{
    email : string;
    newPassword?: string
}


export interface userMinData{
    email : string;
    username : string;
}

export interface TemporaryUserData extends Document {
    _id: mongoose.Types.ObjectId;
    otp: string;
    userData?: IUser;
    createdAt: Date;
}


export interface Email {
    email:string
}


export interface senderId {
    senderId:string
}


interface UserId {
    userId: string;
  }
  
export type UserIdList = UserId[];
  