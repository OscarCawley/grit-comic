const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendPasswordResetEmail = async (email, resetLink) => {

    const mailOptions = {
        from: `"Grit Comic" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset',
        html: `
            <div style="
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background-color: #f9f9f9; 
                padding: 20px; 
                border: 1px solid #ddd; 
                border-radius: 8px; 
                max-width: 600px; 
                margin: 0 auto;
            ">
                <h2 style="color: #29353C; text-align: center;">Password Reset Request</h2>
                <p style="font-size: 16px;">Hello,</p>
                <p style="font-size: 16px;">
                    You requested a password reset. Click the button below to reset it:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetLink}" style="
                        display: inline-block; 
                        padding: 10px 20px; 
                        font-size: 16px;
                        font-weight: bold; 
                        color: #29353C; 
                        background-color: #AAC7D8; 
                        text-decoration: none; 
                        border-radius: 5px;
                    ">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #555;">
                    If you did not request this, please ignore this email. This link will expire in 1 hour.
                </p>
                <p style="font-size: 14px; text-align: center; color: #777;">
                    – Grit Comic Team
                </p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};



module.exports = { sendPasswordResetEmail };