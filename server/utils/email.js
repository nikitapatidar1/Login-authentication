const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const getAccessToken = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN
  });

  try {
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) reject(err);
        resolve(token);
      });
    });
    return accessToken;
  } catch (err) {
    console.error('OAuth2 Token Error:', err);
    throw new Error('Failed to get access token');
  }
};

module.exports = async ({ to, subject, text }) => {
  try {
    // 1. ट्रांसपोर्टर कॉन्फिगरेशन
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: await getAccessToken()
      }
    });

    // 2. ईमेल कंटेंट
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: `<div>${text.replace(/\n/g, '<br>')}</div>`
    };

    // 3. ईमेल भेजें
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent to:', to, 'Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    console.error('Email Error Details:', {
      error: err.message,
      stack: err.stack,
      envVars: {
        user: process.env.EMAIL_USER,
        clientId: !!process.env.OAUTH_CLIENT_ID,
        clientSecret: !!process.env.OAUTH_CLIENT_SECRET,
        refreshToken: !!process.env.OAUTH_REFRESH_TOKEN
      }
    });
    throw new Error(`Email failed: ${err.message}`);
  }
};