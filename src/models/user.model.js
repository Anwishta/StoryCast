import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    userName: {
        type: Number,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    coverImage: {
        type: String
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    gender: {
        type: String,
        enum: ["Male", "Female"]
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true})

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return next(); //this is to prevent the password field
    // from being modified every time we save some other data i.e password will only be encrypted when we first save it 
    // or edit/change the password
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare('password', this.password)
}

userSchema.methods.generateAccesToken = function(){
    return jwt.sign({
        id: this._id,
        userName: this.userName,
        email: this.email,
        fullName: this.fullName
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        id: this.id,
        userName: this.userName,
        fullName: this.fullName,
        email: this.email
    }), process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    }
}

export const User = mongoose.model("User", userSchema)