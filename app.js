import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middleware/errorHanding.js";
import { createTables } from "./utils/create_tables.js";
dotenv.config();

import productRouter from "./routes/productsRoute/productRoutes.js";
import authRouter from "./routes/usersRoute/authRoutes.js";

const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(fileUpload({
    tempFileDir: "./uploads",
    useTempFiles: true,
}));


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);

createTables();

app.use(errorMiddleware)

export default app;