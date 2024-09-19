import nodemailer from 'nodemailer';
import config from '../infrastructure/config/config';
import fs from 'fs';
import path from 'path';

const logoPath = path.resolve(__dirname, '../assets/emailSend.jpeg');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.EMAIL,
        pass: config.EMAIL_PASS
    }
});

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
    const mailOptions = {
        from: config.EMAIL,
        to,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #dddddd;">
            <div style="text-align: center; padding-bottom: 20px;">
            <h1> EduYou </h1>
                <img src="cid:logo" alt="Your Company Logo" style="width: 300px; height: auto;">
            </div>
            <div style="padding: 20px; background-color: #f7f7f7; border-radius: 5px;">
                <h2 style="color: #333333; margin-bottom: 10px;">Your OTP Code</h2>
                <p style="font-size: 16px; color: #555555;">Hello,</p>
                <p style="font-size: 16px; color: #555555;">We received a request to access your account. Use the OTP below to complete the verification process:</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #0073e6; color: #ffffff; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px;">
                    ${otp}
                </div>
                <p style="font-size: 16px; color: #555555;">If you did not request this code, you can safely ignore this email.</p>
                <p style="font-size: 16px; color: #555555;">Thank you,</p>
                <p style="font-size: 16px; color: #555555;">Your Company Team</p>
            </div>
            <div style="text-align: center; padding-top: 20px; color: #999999; font-size: 14px;">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
                <p><a href="mailto:darsandinesh100@gmail.com" style="color: #0073e6; text-decoration: none;">darsandinesh100@gmail.com</a></p>
            </div>
        </div>`,
        attachments: [
            {
                filename: 'emailSend.jpeg',
                path: logoPath,
                cid: 'logo' // same cid as in the html img src
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Mail sent to", to);
    } catch (error) {
        console.error("Error sending OTP", error);
        throw new Error("Failed to send OTP email");
    }
};
