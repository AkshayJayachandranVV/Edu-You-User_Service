import nodemailer from 'nodemailer';
import config from '../infrastructure/config/config';
import fs from 'fs';
import path from 'path';

const logoPath = path.resolve(__dirname, '../assets/emailSend.jpeg');
const logoBuffer = fs.readFileSync(logoPath);

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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your OTP Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <!-- Header with Logo -->
                <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
                    <h1 style="font-size: 28px; color: #0073e6;">EduYou</h1>
                    <img src="cid:logo" alt="EduYou Logo" style="width: 200px; height: auto;">
                </div>
                
                <!-- Content Section -->
                <div style="padding: 40px 20px; text-align: center;">
                    <h1 style="color: #333; margin: 0 0 20px; font-size: 28px;">Your OTP Code</h1>
                    <p style="font-size: 16px; color: #555; margin: 0 0 10px;">Dear user,</p>
                    
                    <!-- OTP Display -->
                    <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                        <p style="font-size: 16px; color: #555; margin: 0 0 10px;">Your OTP code is:</p>
                        <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 10px 0;">
                            ${otp}
                        </div>
                        <p style="font-size: 14px; color: #666; margin: 10px 0 0;">This code will expire in 10 minutes</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #555; margin: 20px 0 10px;">Please use this code to complete your verification process.</p>
                    <p style="font-size: 16px; color: #555; margin: 0 0 5px;">Thank you,</p>
                    <p style="font-size: 16px; color: #555; margin: 0;">EduYou Team</p>
                </div>
                
                <!-- Footer Section -->
                <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
                    <p style="font-size: 14px; color: #999; margin: 0 0 10px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                    <p style="font-size: 14px; color: #999; margin: 0 0 5px;">
                        &copy; ${new Date().getFullYear()} EduYou. All rights reserved.
                    </p>
                    <p style="font-size: 14px; color: #999; margin: 0;">
                        <a href="mailto:darsandinesh100@gmail.com" 
                           style="color: #0073e6; text-decoration: none;">
                           akshayjayachandranvv@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </body>
        </html>`,
        attachments: [
            {
                filename: 'emailSend.jpeg',
                content: logoBuffer,
                cid: 'logo' // Content ID for inline logo image
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
