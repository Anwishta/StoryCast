import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

playlistSchema.plugin(mongooseAggregatePaginate);
export const Playlist = mongoose.model('Playlist', playlistSchema);