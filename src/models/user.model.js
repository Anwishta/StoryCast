import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: Number,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
        unique: true
    },
    fullname: {
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
    avator: {
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

export const User = Schema.model("User", userSchema)