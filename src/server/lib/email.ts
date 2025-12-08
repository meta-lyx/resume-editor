import { Resend } from 'resend';

export interface SendEmailParams {
  to: string;
  resendApiKey: string;
}

export interface VerificationEmailParams extends SendEmailParams {
  verificationUrl: string;
}

export interface WelcomeEmailParams extends SendEmailParams {
  name: string;
}

export interface ResetPasswordParams extends SendEmailParams {
  resetUrl: string;
  name: string;
}

// Send verification email
export async function sendVerificationEmail({
  to,
  verificationUrl,
  resendApiKey,
}: VerificationEmailParams) {
  const resend = new Resend(resendApiKey);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Resume Editor <noreply@yourdomain.com>', // TODO: Update with actual domain
      to: [to],
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #4F46E5; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verify Your Email Address</h1>
              <p>Thank you for signing up for AI Resume Editor!</p>
              <p>Please click the button below to verify your email address and activate your account:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This link will expire in 24 hours.</p>
              <div class="footer">
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} AI Resume Editor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    if (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
    
    console.log('Verification email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Send welcome email
export async function sendWelcomeEmail({
  to,
  name,
  resendApiKey,
}: WelcomeEmailParams) {
  const resend = new Resend(resendApiKey);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Resume Editor <noreply@yourdomain.com>',
      to: [to],
      subject: 'Welcome to AI Resume Editor!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #4F46E5; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px;
                margin: 20px 0;
              }
              .features { 
                background-color: #F3F4F6; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
              }
              .features ul { list-style: none; padding: 0; }
              .features li { padding: 8px 0; }
              .features li:before { content: "✓ "; color: #10B981; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome, ${name}! 🎉</h1>
              <p>Your account has been successfully verified!</p>
              <p>You can now access all the powerful features of AI Resume Editor:</p>
              
              <div class="features">
                <h3>What You Can Do:</h3>
                <ul>
                  <li>Upload and optimize your resume with AI</li>
                  <li>Tailor resumes for specific job descriptions</li>
                  <li>ATS optimization to pass screening systems</li>
                  <li>Professional language enhancement</li>
                  <li>Achievement quantification</li>
                </ul>
              </div>
              
              <a href="${process.env.APP_URL || 'https://ai-resume-editor.pages.dev'}/dashboard" class="button">
                Get Started
              </a>
              
              <p>Need help? Reply to this email or check our documentation.</p>
              
              <div style="margin-top: 30px; font-size: 12px; color: #666;">
                <p>&copy; ${new Date().getFullYear()} AI Resume Editor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    if (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
    
    console.log('Welcome email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Send password reset email
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  name,
  resendApiKey,
}: ResetPasswordParams) {
  const resend = new Resend(resendApiKey);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Resume Editor <noreply@yourdomain.com>',
      to: [to],
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #EF4444; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px;
                margin: 20px 0;
              }
              .warning { 
                background-color: #FEF3C7; 
                padding: 15px; 
                border-left: 4px solid #F59E0B; 
                margin: 20px 0; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Password Reset Request</h1>
              <p>Hello ${name},</p>
              <p>We received a request to reset your password for AI Resume Editor.</p>
              <p>Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              </div>
              
              <div style="margin-top: 30px; font-size: 12px; color: #666;">
                <p>&copy; ${new Date().getFullYear()} AI Resume Editor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    if (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
    
    console.log('Password reset email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Send subscription confirmation email
export async function sendSubscriptionEmail({
  to,
  name,
  planName,
  resendApiKey,
}: SendEmailParams & { name: string; planName: string }) {
  const resend = new Resend(resendApiKey);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Resume Editor <noreply@yourdomain.com>',
      to: [to],
      subject: `Subscription Confirmed: ${planName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .success { 
                background-color: #D1FAE5; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
                text-align: center;
              }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #10B981; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎉 Subscription Confirmed!</h1>
              <p>Hello ${name},</p>
              
              <div class="success">
                <h2 style="margin: 0; color: #059669;">Welcome to ${planName}!</h2>
                <p style="margin: 10px 0 0 0;">Your subscription is now active.</p>
              </div>
              
              <p>You now have access to all premium features:</p>
              <ul>
                <li>Unlimited resume optimizations</li>
                <li>Advanced AI models</li>
                <li>Priority support</li>
                <li>Custom templates</li>
              </ul>
              
              <a href="${process.env.APP_URL || 'https://ai-resume-editor.pages.dev'}/dashboard" class="button">
                Start Optimizing
              </a>
              
              <p>You can manage your subscription anytime from your account settings.</p>
              
              <div style="margin-top: 30px; font-size: 12px; color: #666;">
                <p>&copy; ${new Date().getFullYear()} AI Resume Editor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    if (error) {
      console.error('Failed to send subscription email:', error);
      throw new Error('Failed to send subscription email');
    }
    
    console.log('Subscription email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

