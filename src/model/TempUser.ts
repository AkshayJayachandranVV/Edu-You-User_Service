import mongoose,{Document,Schema} from "mongoose";
import {IUser} from "../domain/entities/IUser"


export interface ITemporaryUser extends Document{
    _id: mongoose.Types.ObjectId;
    otp: string;
    userData?: IUser;
    createdAt: Date;
}


const TemporaryUserSchema: Schema = new Schema({
    otp: {type: String, required:true},
    userData: {type: Object as any, required: false},
    createdAt: {type: Date, default: Date.now(), expires: 900}  // expires on 15 minutes
})


export const TemporaryUser = mongoose.model<ITemporaryUser>(
    "TemporaryUser",
    TemporaryUserSchema
)

