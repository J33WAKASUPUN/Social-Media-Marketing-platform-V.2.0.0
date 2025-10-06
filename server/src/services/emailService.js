const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_PORT == 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@socialmedia.com',
        to: email,
        subject: 'Verify Your Email',
        html: `
          <h1>Email Verification</h1>
          <p>Click the link below to verify your email:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
        `,
      });
      
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
    }
  }
  
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@socialmedia.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      });
      
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
    }
  }
}

module.exports = new EmailService();