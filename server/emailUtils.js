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
                <h2 style="color: #222222; text-align: center; margin: 0;">Password Reset Request</h2>
                <p style="font-size: 16px; text-align: center;">Hello,</p>
                <p style="font-size: 16px; text-align: center;">
                    You requested a password reset. Click the button below to reset it:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetLink}" 
                        style="
                            display: inline-block;
                            padding: 12px 20px;
                            font-size: 1.1em;
                            font-weight: 600;
                            font-family: Arial, sans-serif;
                            color: #222222;
                            background: #32FFB0;
                            text-decoration: none;
                            border-radius: 8px;
                            width: 250px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
                            border: none;
                        ">
                        Reset Password
                    </a>
                    <p style="
                        font-size: 14px; 
                        color: #555555; 
                        text-align: center; 
                        margin-top: 15px; 
                        line-height: 1.4;
                    ">
                        If the button doesn’t work, copy and paste this link into your browser:<br>
                        <a href="${resetLink}" 
                            style="color: #2ACFAF; text-decoration: underline; word-break: break-all;">
                            ${resetLink}
                        </a>
                    </p>
                </div>
                <p style="font-size: 14px; color: #555; text-align: center;">
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

const sendSupportEmail = async (username, email, message) => {

    const mailOptions = {
        from: `${username}`,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: 'Support Request',
        text: message,
    };

    await transporter.sendMail(mailOptions);
};

const sendNewsletterEmails = async (title, content, users) => {

    if (!users || users.length === 0) return;
    if (!title || !content) return;
    for (const user of users) {
        const mailOptions = {
            from: `"Grit Comic" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Grit Comic Update: ${title}`,
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
                    <h2 style="color: #222222; text-align: center; margin: 0;">New Update: ${title}</h2>
                    <div style="font-size: 16px; margin-top: 20px; text-align: center;">
                        ${content}
                    </div>
                    <p style="font-size: 14px; text-align: center; color: #777; margin-top: 30px;">
                        – Grit Comic Team
                    </p>
                    <div style="margin-top: 10px; font-size: 12px; color: #999; text-align: center;">
                        If you wish to unsubscribe from these emails, please click 
                        <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${user.unsubscribe_token}" style="
                            display: inline-block; 
                            font-size: 12px;
                            font-weight: bold; 
                            color: #2ACFAF;  
                        ">Unsubscribe.</a>
                    </div>
                </div>
            `
        }
        await transporter.sendMail(mailOptions);
    }
};

const sendVerificationEmail = async (email, token) => {

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"Grit Comic" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email Address',
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
                <h2 style="color: #222222; text-align: center;">Verify Email</h2>
                <div style="font-size: 16px; margin-top: 20px; text-align: center;">
                    Please verify your email address by clicking the button below:
                </div>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${verificationLink}" style="
                        display: inline-block;
                            padding: 12px 20px;
                            font-size: 1.1em;
                            font-weight: 600;
                            font-family: Arial, sans-serif;
                            color: #222222;
                            background: #32FFB0;
                            text-decoration: none;
                            border-radius: 8px;
                            width: 250px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
                            border: none;
                    ">Verify Email</a>
                    <p style="
                        font-size: 14px; 
                        color: #555555; 
                        text-align: center; 
                        margin-top: 15px; 
                        line-height: 1.4;
                    ">
                        If the button doesn’t work, copy and paste this link into your browser:<br>
                        <a href="${verificationLink}" 
                            style="color: #2ACFAF; text-decoration: underline; word-break: break-all;">
                            ${verificationLink}
                        </a>
                    </p>
                </div>
                <p style="font-size: 14px; color: #555; text-align: center;">
                    If you did not create an account, please ignore this email.
                </p>
                <p style="font-size: 14px; text-align: center; color: #777; margin-top: 30px;">
                    – Grit Comic Team
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail, sendSupportEmail, sendNewsletterEmails, sendVerificationEmail };