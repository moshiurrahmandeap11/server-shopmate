import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import database from "../database/db.js";
import { catchAsyncErrors } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/errorHanding.js";
import { generateForgotPasswordEmailTemplate } from "../utils/generateForgotPasswordEmailTemplate.js";
import { generateResetPasswordToken } from "../utils/generateResetPasswordToken.js";
import { sendToken } from "../utils/jwtTokens.js";
import { sendEmail } from "../utils/sendEmail.js";
dotenv.config();

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please provide all required fields: ", 400));
  }

  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 and 20 characters", 400),
    );
  }

  const isAlreadyRegistered = await database.query(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()],
  );

  if (isAlreadyRegistered.rows.length > 0) {
    return next(
      new ErrorHandler("User already registered with this email", 400),
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await database.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, hashedPassword],
  );

  sendToken(user.rows[0], 201, "User Registered Successfully", res);
});
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }
  const user = await database.query(`SELECT * FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);
  if (user.rows.length === 0) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isMatch = await bcrypt.compare(password, user.rows[0].password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid password", 401));
  }
  sendToken(user.rows[0], 200, "User logged in successfully", res);
});
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const { user } = req;
  res.status(200).json({
    success: true,
    user,
  });
});
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Log out successfully",
    });
});
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const { frontendUrl } = req.query;
  let userResult = await database.query(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()],
  );

  if (userResult.rows.length === 0) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const user = userResult.rows[0];
  const { hashedToken, resetPasswordExpireTime, resetToken } =
    generateResetPasswordToken();

  await database.query(
    `UPDATE users SET reset_password_token = $1, reset_password_expire = to_timestamp($2) WHERE email = $3 `,
    [hashedToken, resetPasswordExpireTime / 1000, email.toLowerCase()],
  );

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "ShopMate password Reset",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    await database.query(
      `UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE email = $1`,
      [email.toLowerCase()],
    );
    return next(new ErrorHandler("Email could not send ", 500));
  }
});
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await database.query(
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW() ",
    [resetPasswordToken],
  );

  if (user.rows.length === 0) {
    return next(new ErrorHandler("Invalid or expired reset token", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match ", 400));
  }

  if (
    req.body.password?.length < 8 ||
    req.body.password?.length > 16 ||
    req.body.confirmPassword?.length < 8 ||
    req.body.confirmPassword?.length > 16
  ) {
    return next(
      new ErrorHandler("Password must be between 8 and 20 characters", 400),
    );
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const updatedUser = await database.query(
    `UPDATE users SET password = $1, reset_password_token = NULL , reset_password_expire = NULL WHERE id = $2 RETURNING *`[
      (hashedPassword, user.rows[0].id)
    ],
  );
  sendToken(updatedUser.rows[0], 200, "Password reset successfully", res);
});
