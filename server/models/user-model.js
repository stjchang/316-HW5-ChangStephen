const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const UserSchema = new Schema(
    {
        userName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        avatarImage: { type: String, required: false }, 
        playlists: [{type: ObjectId, ref: 'Playlist'}]
    },
    { timestamps: true },
)

module.exports = mongoose.model('User', UserSchema)
