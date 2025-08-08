import { WaitlistEmailData, EmailType } from './types';

export const EMAIL_TEMPLATES: Record<EmailType, {
  subject: string;
  tags: string[];
  getHtml: (data: WaitlistEmailData, baseUrl: string) => string;
  getText: (data: WaitlistEmailData, baseUrl: string) => string;
}> = {
  [EmailType.VERIFICATION]: {
    subject: '🎭 Verify Your Email - Welcome to the Unmask Revolution!',
    tags: ['verification', 'waitlist'],
    getHtml: (data: WaitlistEmailData, baseUrl: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Unmask</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #0a0a0a;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(255, 107, 157, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .tagline {
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 20px;
            color: #fff;
            text-align: center;
          }
          .verification-box {
            background: rgba(255, 107, 157, 0.1);
            border: 1px solid rgba(255, 107, 157, 0.2);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
          }
          .footer {
            background: #111;
            padding: 30px 20px;
            text-align: center;
            color: #888;
            font-size: 14px;
          }
          .footer a {
            color: #ff6b9d;
            text-decoration: none;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #ff6b9d;
            text-decoration: none;
          }
          @media (max-width: 600px) {
            .container {
              margin: 0 10px;
            }
            .content {
              padding: 30px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎭 Unmask</div>
            <div class="tagline">Authentic Dating Revolution</div>
          </div>
          
          <div class="content">
            <h1 style="color: #fff; margin-bottom: 20px;">Almost There! 🚀</h1>
            <p style="font-size: 18px; margin-bottom: 30px; color: #ccc;">
              Thanks for joining the revolution! We just need to verify your email address to secure your spot on the waitlist.
            </p>
            
            <div class="verification-box">
              <h2 style="color: #ff6b9d; margin-bottom: 15px;">One Click Away</h2>
              <p style="color: #ccc; margin-bottom: 25px;">
                Click the button below to verify your email and officially join the Unmask waitlist:
              </p>
              
              <a href="${baseUrl}/api/waitlist/verify?token=${data.verificationToken}" class="button">
                ✨ Verify My Email
              </a>
              
              <p style="font-size: 12px; color: #888; margin-top: 20px;">
                This link will expire in 24 hours for security reasons.
              </p>
            </div>
            
            <div style="background: rgba(78, 205, 196, 0.1); border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #4ecdc4; margin-bottom: 15px;">What to Expect 💫</h3>
              <ul style="text-align: left; color: #ccc; padding-left: 20px;">
                <li style="margin-bottom: 8px;">🎯 Early access when we launch</li>
                <li style="margin-bottom: 8px;">📱 Exclusive beta testing opportunities</li>
                <li style="margin-bottom: 8px;">💎 Premium features at no cost</li>
                <li style="margin-bottom: 8px;">🎉 Be part of the dating revolution</li>
              </ul>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
              Having trouble with the button? Copy and paste this link:<br>
              <a href="${baseUrl}/api/waitlist/verify?token=${data.verificationToken}" style="color: #ff6b9d; word-break: break-all;">
                ${baseUrl}/api/waitlist/verify?token=${data.verificationToken}
              </a>
            </p>
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="#">Twitter</a>
              <a href="#">Instagram</a>
              <a href="#">TikTok</a>
            </div>
            <p>
              © 2024 Unmask.life - Built for GenZ, by GenZ<br>
              <a href="${baseUrl}/privacy-policy">Privacy Policy</a> | 
              <a href="${baseUrl}/api/waitlist/unsubscribe?token=${data.unsubscribeToken}">Unsubscribe</a>
            </p>
            <p style="font-size: 12px; margin-top: 15px;">
              You received this email because you signed up for the Unmask waitlist.<br>
              If you didn't sign up, you can safely ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (data: WaitlistEmailData, baseUrl: string) => `
      🎭 Welcome to Unmask - Verify Your Email
      
      Hi there!
      
      Thanks for joining the Unmask waitlist! We're building the future of authentic dating, and you're going to be part of it.
      
      VERIFY YOUR EMAIL:
      Click here: ${baseUrl}/api/waitlist/verify?token=${data.verificationToken}
      
      What you'll get:
      • Early access when we launch
      • Exclusive beta testing opportunities  
      • Premium features at no cost
      • Be part of the dating revolution
      
      This verification link expires in 24 hours.
      
      Welcome to the revolution!
      The Unmask Team
      
      ---
      Unsubscribe: ${baseUrl}/api/waitlist/unsubscribe?token=${data.unsubscribeToken}
    `,
  },

  [EmailType.WELCOME]: {
    subject: '🎉 Welcome to Unmask - You\'re In!',
    tags: ['welcome', 'waitlist', 'verified'],
    getHtml: (data: WaitlistEmailData, baseUrl: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Unmask</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #0a0a0a;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(255, 107, 157, 0.1);
          }
          .celebration {
            background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%);
            padding: 50px 20px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
          }
          .celebration::before {
            content: '🎊';
            position: absolute;
            top: 20px;
            left: 20px;
            font-size: 24px;
            animation: float 3s ease-in-out infinite;
          }
          .celebration::after {
            content: '🎉';
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 24px;
            animation: float 3s ease-in-out infinite reverse;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .logo {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 20px;
            color: #fff;
            text-align: center;
          }
          .welcome-box {
            background: rgba(78, 205, 196, 0.1);
            border: 1px solid rgba(78, 205, 196, 0.2);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
          }
          .position-badge {
            background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%);
            color: white;
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: 600;
            display: inline-block;
            margin: 15px 0;
            box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .feature {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .footer {
            background: #111;
            padding: 30px 20px;
            text-align: center;
            color: #888;
            font-size: 14px;
          }
          .footer a {
            color: #ff6b9d;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="celebration">
            <div class="logo">🎭 Unmask</div>
            <h1 style="margin: 0; font-size: 28px;">You're In! 🚀</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
              Welcome to the authentic dating revolution
            </p>
          </div>
          
          <div class="content">
            <div class="welcome-box">
              <h2 style="color: #4ecdc4; margin-bottom: 15px;">Email Verified Successfully! ✅</h2>
              <p style="color: #ccc; margin-bottom: 20px;">
                You're now officially part of the Unmask community. Get ready for a completely new way to connect with people.
              </p>
              ${data.waitlistPosition ? `
                <div class="position-badge">
                  You're #${data.waitlistPosition} on the waitlist! 🏆
                </div>
              ` : ''}
            </div>
            
            <div class="features-grid">
              <div class="feature">
                <div class="feature-icon">🎯</div>
                <h3 style="color: #ff6b9d; margin-bottom: 10px;">Early Access</h3>
                <p style="color: #ccc; font-size: 14px;">
                  Be among the first to experience authentic dating when we launch.
                </p>
              </div>
              <div class="feature">
                <div class="feature-icon">👥</div>
                <h3 style="color: #4ecdc4; margin-bottom: 10px;">Beta Testing</h3>
                <p style="color: #ccc; font-size: 14px;">
                  Help shape the future of dating by testing exclusive features.
                </p>
              </div>
              <div class="feature">
                <div class="feature-icon">💎</div>
                <h3 style="color: #ff6b9d; margin-bottom: 10px;">Premium Features</h3>
                <p style="color: #ccc; font-size: 14px;">
                  Enjoy premium features at no cost as a founding member.
                </p>
              </div>
            </div>
            
            <div style="background: rgba(255, 107, 157, 0.1); border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #ff6b9d; margin-bottom: 15px;">What's Next? 🔮</h3>
              <p style="color: #ccc; text-align: left; line-height: 1.6;">
                • 📬 We'll send you exclusive updates about our progress<br>
                • 🎉 Get invited to beta testing when it's ready<br>
                • 🚀 Be notified the moment we launch<br>
                • 💌 Share with friends to move up in the queue
              </p>
            </div>
            
            <p style="color: #888; font-size: 16px; margin-top: 30px;">
              Ready to revolutionize dating together? 💫<br>
              <strong style="color: #4ecdc4;">The future of authentic connections starts with you.</strong>
            </p>
          </div>
          
          <div class="footer">
            <div style="margin-bottom: 20px;">
              <a href="#" style="margin: 0 10px;">Twitter</a>
              <a href="#" style="margin: 0 10px;">Instagram</a>
              <a href="#" style="margin: 0 10px;">TikTok</a>
            </div>
            <p>
              © 2024 Unmask.life - Dating Reimagined<br>
              <a href="${baseUrl}/privacy-policy">Privacy Policy</a> | 
              <a href="${baseUrl}/api/waitlist/unsubscribe?token=${data.unsubscribeToken}">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (data: WaitlistEmailData, baseUrl: string) => `
      🎉 Welcome to Unmask - You're In!
      
      Your email has been verified successfully! ✅
      
      You're now officially part of the Unmask community and ready for a completely new way to connect with people.
      
      ${data.waitlistPosition ? `🏆 You're #${data.waitlistPosition} on the waitlist!` : ''}
      
      What you get as a founding member:
      • 🎯 Early access when we launch
      • 👥 Exclusive beta testing opportunities
      • 💎 Premium features at no cost
      • 🚀 Be part of the dating revolution
      
      What's next?
      • We'll send you exclusive updates about our progress
      • Get invited to beta testing when it's ready
      • Be notified the moment we launch
      • Share with friends to move up in the queue
      
      Ready to revolutionize dating together? The future of authentic connections starts with you.
      
      Welcome to the revolution!
      The Unmask Team
      
      ---
      Unsubscribe: ${baseUrl}/api/waitlist/unsubscribe?token=${data.unsubscribeToken}
    `,
  },

  [EmailType.LAUNCH_NOTIFICATION]: {
    subject: '🚀 IT\'S HERE! Unmask is Now Live - Your Early Access Awaits',
    tags: ['launch', 'early-access'],
    getHtml: (data: WaitlistEmailData, baseUrl: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unmask is Live!</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #0a0a0a;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(255, 107, 157, 0.2);
          }
          .launch-header {
            background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
          }
          .logo {
            font-size: 42px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .launch-cta {
            background: white;
            color: #ff6b9d;
            padding: 18px 36px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            text-decoration: none;
            display: inline-block;
            margin: 25px 0;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
          }
          .launch-cta:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          }
          .content {
            padding: 40px 20px;
            color: #fff;
            text-align: center;
          }
          .footer {
            background: #111;
            padding: 30px 20px;
            text-align: center;
            color: #888;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="launch-header">
            <div class="logo">🎭 Unmask</div>
            <h1 style="font-size: 32px; margin: 0;">IT'S LIVE! 🚀</h1>
            <p style="font-size: 18px; margin: 15px 0;">The dating revolution starts now</p>
            
            <a href="#" class="launch-cta">
              🎉 Get Early Access Now
            </a>
          </div>
          
          <div class="content">
            <h2 style="color: #4ecdc4;">You Made This Possible ✨</h2>
            <p style="font-size: 18px; color: #ccc; margin-bottom: 30px;">
              Thanks to amazing people like you, Unmask is now live and ready to revolutionize how we connect authentically.
            </p>
            
            <p style="color: #888; margin-top: 30px;">
              Download the app, create your profile, and start experiencing dating the way it should be.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Unmask.life</p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (data: WaitlistEmailData, baseUrl: string) => `
      🚀 IT'S HERE! Unmask is Now Live
      
      The dating revolution starts now!
      
      Thanks to amazing people like you, Unmask is now live and ready to revolutionize how we connect authentically.
      
      Your early access is ready - download the app and start experiencing dating the way it should be.
      
      Welcome to the future of authentic dating!
      The Unmask Team
    `,
  },
};

export function generateEmailTemplate(
  type: EmailType,
  data: WaitlistEmailData,
  baseUrl: string = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
): { subject: string; html: string; text: string; tags: string[] } {
  const template = EMAIL_TEMPLATES[type];
  
  if (!template) {
    throw new Error(`Unknown email template type: ${type}`);
  }

  return {
    subject: template.subject,
    html: template.getHtml(data, baseUrl),
    text: template.getText(data, baseUrl),
    tags: template.tags,
  };
}