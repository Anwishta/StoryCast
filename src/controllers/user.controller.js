import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiSuccess } from "../utils/ApiSuccess.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccesToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false});

      return {accessToken, refreshToken}
   } catch (error) {
      throw new ApiError(500, "Something went wrong with generating refresh and access token");
   }
}

const registerUser = asyncHandler( async (req, res) => {
   //get user datails from frontend
   //check validation fields
   //check whether the user already exists -> by email, username
   //save the avatar, coverImage in multer and upload to cloudinary
   //get required cloudinary url 
   //encrypt the password (by hashing/salt)
   //create user object and store the data to db
   //remove password and refresh token field from the response
   //check for user creation
   //return response

   const { userName, fullName, email, password } = req.body;
   console.log(email);
   
   if([userName, fullName, email, password].some((field) => field?.trim() === "")){
      throw new ApiError(400, "All fields are required!")
   }
   
   const userExists = await User.findOne({
      $or: [{ userName }, { email }]
   })

   if(userExists){
      throw new ApiError(409, "username or email already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path;
   }

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
      throw new ApiError(400, "Avatar is required")
   }

   const user = await User.create({
      userName: userName.toLowerCase(),
      fullName, 
      email, 
      password,
      avatar: avatar.url, 
      coverImage: coverImage?.url || ""
   })

   if(!user){
      throw new ApiError(409, "Error while registering the user");
   }

   const createdUser = await User.findById(user._id).select("-password -refreshToken")

   if(!createdUser){
      throw new ApiError(500, "Something went wrong while registering the user");
   }

   return res.status(200).json(
      new ApiSuccess(200, createdUser, "User registered successfully")                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
   )
})

const loginUser = asyncHandler( async (req, res) => {
   const { email, username, password } = req.body;

   if(!email && !username){
      throw new ApiError(400, "Email or username is required")
   }

   const user = await User.findOne({
      $or: [{email}, {username}]
   })

   if(!user){
      throw new ApiError(400, "User not found")
   }

   const isPasswordCorrect = await user.isPasswordCorrect(password);

   if(!isPasswordCorrect){
      throw new ApiError(401, "Invalid User credentials");
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

   const loggedInUser = await user.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200,
         {
            user: loggedInUser, accessToken, refreshToken
         },
         "User logged in successfully"
      )
   )
   
})

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(401, "Unauthorized Access")
   }

   try{
   const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

   const user = await User.findById(decoded?._id)

   if(!user){
      throw new ApiError(401, "Invalid refresh token")
   }

   if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Invalid refresh token")
   }

   const options = {
      httpOnly: true,
      secure: true
   }

   const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

   res.status(200)
   .cookie("AccessToken", accessToken, options)
   .cookie("RefreshToken", newRefreshToken, options)
   .json(new ApiResponse(200,
         { accessToken, newRefreshToken },
         "AccessToken refreshed successfully"
   ))
   }catch(error){
      throw new ApiError(401, "Error refreshing token")
   }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

   const { oldPassword, newPassword, confirmPassword } = req.body;

   if(newPassword !== confirmPassword){
      throw new ApiError(401, "Password incorrect")
   }

   const user = await User.findById(req?.user._id);
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
      throw new ApiError(401, "Invalid Old Password")
   }

   user.password = newPassword;
   await user.save({validateBeforeSave: false});

   return res.status(200)
             .json(new ApiSuccess(200, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
   return req
   .status(200)
   .json(new ApiSuccess(200, req.user, "User fetched successfully"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
   const {fullName, email} = req.body

   if(!fullName || !email){
      throw new ApiError(401, "Both fullName and email required");
   }

   await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullName,
            email: email
         }
      },
      {new : true}
   ).select("-password");
})

const updateAvatar = asyncHandler(async (req, res) => {

   const avatarLocalPath = req.file?.path;

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);

   if(!avatar.url){
      throw new ApiError(400, "Error uploading avatar")
   }

   await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      {new: true}
   )
   return res
   .status(200)
   .json(new ApiSuccess(200, "Avatar updated successfully"))
})

export { 
   registerUser, 
   loginUser, 
   logoutUser, 
   refreshAccessToken, 
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateAvatar
 };