import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const videoSchema = Schema({
    videoURL: {
        type: String, // from third party service like aws or cloudinary
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    caption: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timeStamps: true})

mongoose.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)