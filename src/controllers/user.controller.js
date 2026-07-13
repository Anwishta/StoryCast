import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
   
   const userExists = User.findOne({
      $or: [{ userName }, { email }]
   })

   if(userExists){
      throw new ApiError(409, "username or email already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.paths?.coverImage[0]?.path;

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
      new ApiResponse(200, createdUser, "User registered successfully")                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
   )
})

export { registerUser } ;