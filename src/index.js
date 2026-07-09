//require('dotenv').config({path: '/.env'})
import dotenv from 'dotenv'
import express from 'express'
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is listening on ${process.env.PORT || 8000}`)
    })
})
.catch((err) => {
    console.error(`Error connecting to database ${error}`)
    throw err
})

