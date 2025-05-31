export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email ✅</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Confirm Your Registration 🎉</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for registering with <strong>VenueVerse</strong>! To complete your registration, please verify your email address with the following code:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to activate your account and start booking venues. 🏢</p>
    <p>For your security, this code will expire in 15 minutes. ⏳</p>
    <p>If you didn’t sign up for an account, no further action is required. Please ignore this email.</p>
    <p>Best regards,<br>The VenueVerse Team</p>
  </div>
</body>
</html>
`;

export const WELCOME_MESSAGE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VenueVerse! 🎉</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2196F3, #0b79d0); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to VenueVerse! 🎊</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {username},</p>
    <p>Thank you for joining <strong>VenueVerse</strong>, your go-to platform for booking and managing venues! 🏢✨</p>
    <p>Here's what you can do to get started:</p>
    <ul>
      <li>Explore available venues and find the perfect space for your events. 🎭</li>
      <li>Book venues seamlessly and manage your reservations. 📅</li>
      <li>Set up your own venue listings and attract customers. 💼</li>
    </ul>
    <p>If you need any assistance, our support team is here to help. 💬</p>
    <p>We’re excited to have you with us!</p>
    <p>Best regards,<br>The VenueVerse Team</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful 🔒</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful ✅</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello <strong>{username}</strong>,</p>
    <p>Your password for <strong>VenueVerse</strong> has been successfully reset. 🔑</p>
    <p>If you did not initiate this password reset, please contact our support team immediately to secure your account. 🚨</p>
    <p>Best regards,<br>The VenueVerse Team</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password 🔄</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Request 🔄</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password for your <strong>VenueVerse</strong> account. If you didn't make this request, you can safely ignore this email. 🚫</p>
    <p>To reset your password, please click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">🔐 Reset Password</a>
    </div>
    <p>This reset link will expire in 1 hour. ⏳</p>
    <p>Best regards,<br>The VenueVerse Team</p>
  </div>
</body>
</html>
`;

export const BOOKING_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #4CAF50;
      padding: 15px;
      text-align: center;
      color: white;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
    }
    .content h2 {
      color: #333333;
    }
    .details {
      margin-top: 20px;
    }
    .details p {
      margin: 8px 0;
      font-size: 16px;
    }
    .services {
      background-color: #f9f9f9;
      padding: 10px 15px;
      margin-top: 15px;
      border-left: 4px solid #4CAF50;
      border-radius: 5px;
    }
    .services ul {
      padding-left: 20px;
      margin: 0;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 14px;
      color: #888;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 20px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmed!</h1>
    </div>
    <div class="content">
      <h2>Hi {{userName}},</h2>
      <p>Your venue booking has been successfully confirmed. Here are the details:</p>

      <div class="details">
      <p>Your booking at <strong>{{venueName}}</strong> was successful!</p>
      <p><strong>Address:</strong> {{address}}</p>
      <p><strong>Date:</strong> {{date}}</p>
      <p><strong>Time:</strong> {{start}} - {{end}}</p>
      <p><strong>Total Paid:</strong> Rs. {{totalPrice}}</p>
      </div>

      <div class="services">
        <p><strong>Services Booked:</strong></p>
      <ul>
  {{servicesList}}
</ul>
      </div>

      <a href="{{bookingLink}}" class="btn">View Booking</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} VenueVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

`;
