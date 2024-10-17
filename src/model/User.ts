import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../domain/entities/IUser";

// Extend the IUserDocument interface with the new myCourse field
export interface IUserDocument extends IUser, Document {
    myCourse: Array<{ courseId: mongoose.Schema.Types.ObjectId; date: Date }>;
}

const userSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
    },
    profile_picture: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    about: {
        type: String,
        required: false,
    },
    isBlocked: {
        type: Boolean,
        required: false,
    },
    // Adding the new myCourse field
    myCourse: [
        {
            courseId: {
                type: mongoose.Schema.Types.ObjectId, // Assuming you're referencing another model
                required: true,
                ref: 'Course', // Reference to another model (optional, adjust as needed)
            },
            date: {
                type: Date,
                default: Date.now, // Automatically sets the date when a course is added
            },
        },
    ],
});

// Create the model
export const User = mongoose.model<IUserDocument>('User', userSchema);
