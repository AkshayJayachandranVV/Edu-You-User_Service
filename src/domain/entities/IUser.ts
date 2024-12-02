import mongoose, {Document} from "mongoose";


export interface GoogleLoginUserRequest {
  email: string;
  fullname: string;
}

export interface GoogleLoginUserResponse {
  success: boolean;
  message: string;
  user_data?: UserData; 
  role?:string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  success: boolean;
  message: string;
  role: string;
  userData?: UserData; 
}

export interface VerifyOtpUserRequest {
  otp: string;
  id: string;
}

interface Course {
  courseId: string;
  date: string;
}

export interface UserData {
  id?: string;
  username: string;
  email: string;
  phone: string;
  profile_picture: string;
  password: string;
  createdAt?: string;
  about: string;
  isBlocked: boolean;
  myCourse?: Course[];
}

export interface VerifyOtpUserResponse {
  message: string;
  success: boolean;
  user_data?: UserData; // Optional, included if OTP verification is successful
}




export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  message: string;
  success: boolean;
  forgotPass: boolean;
  userData?: any; 
  tempId?: string; 
}


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
    about: string;
    profile_picture: string;
    created_At?: Date;
    isBlocked:boolean;
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


export interface UserId {
    userId: string;
  }
  
export type UserIdList = UserId[];
  

export interface PaginationData {
  skip: number;
  limit: number;
}


export interface UserCourse {
  userId:string;
  courseId:string;
}

interface Message {
  id: string; 
  userId: string; 
  content: string; 
  timestamp: Date; 
}

export interface ChatUsersData {
  messages: Message[]; 
}


export interface PayoutUserInput {
  userId: string; 
  amount: number; 
  [key: string]: any; 
}


interface User {
  id: string; 
  username: string; 
  email?: string; 
  profile_picture?: string; 
}

export interface PayoutUserOutput extends PayoutUserInput {
  userName: string; // The username of the user (or "Unknown" if not found)
}

export type  PayoutUsersResponse = PayoutUserOutput[];


export interface VerifyOtpInput {
  otp: string;
  id: string;
}

export interface TemporaryUser {
  otp: string;
  userData?: UserData; // UserData is your existing interface
}

// Interface for the function's return type
export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user_data?: UserData; // Include only if success is true
}

export interface ResetPasswordInput {
  newPassword: string;
  email: string;
}

export interface ReturnMessage {
  success: boolean;
  message: string;
}


export interface TutorStudentReturn {
  success:boolean;
  students:IUser[]
}


