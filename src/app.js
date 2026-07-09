import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))

app.use(express.urlencoded({ extended: true, limit: "16kb" })) // extended true is used for nested object (in url query parameter 
//space is converted to %20 this is urlencoded format)

app.use(express.static("public"))

app.use(cookieParser()) // for performing CRUD operation in cookies

export { app };