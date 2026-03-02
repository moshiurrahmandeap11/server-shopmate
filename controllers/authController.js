import bcrypt from "bcrypt";
import database from "../database/db.js";
import { catchAsyncErrors } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/errorHanding.js";
import { sendToken } from "../utils/jwtTokens.js";

export const register = catchAsyncErrors(async(req, res, next) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        return next(new ErrorHandler("Please provide all required fields: ", 400))
    }

    const isAlreadyRegistered = await database.query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);

    if(isAlreadyRegistered.rows.length > 0) {
        return next(new ErrorHandler("User already registered with this email", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await database.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, hashedPassword]);
    
    sendToken(user.rows[0], 201, "User Registered Successfully", res);
});
export const login = catchAsyncErrors(async(req, res, next) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400))
    };
    const user = await database.query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()])
    if(user.rows.length === 0) {
        return next(new ErrorHandler("Invalid email or password", 401));
    };
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if(!isMatch) {
        return next(new ErrorHandler("Invalid password", 401));
    };
    sendToken(user.rows[0], 200, "User logged in successfully", res)
});
export const getUser = catchAsyncErrors(async(req, res, next) => {
    const {user} = req;
    res.status(200).json({
        success: true,
        user,
    })
});
export const logout = catchAsyncErrors(async(req, res, next) => {
    res.status(200).cookie("token", null , {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Log out successfully",
    })
});