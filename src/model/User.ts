import mongoose,{Document,Schema} from "mongoose";

import {IUser} from "../domain/entities/IUser"

export interface IUserDocument extends IUser,Document{}

const userSchema :Schema = new Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now()
    },
    about:{
        type:String,
        required:false
    },
    isBlocked:{
        type:Boolean,
        required:false
    },
})

export const User = mongoose.model<IUserDocument>('User',userSchema)