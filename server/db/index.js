const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Playlist = require("../../models/mongo/playlist-model");
const User = require("../../models/mongo/user-model");


mongoose
    .connect('mongodb://127.0.0.1:27017/playlister')
    .catch(e => {
        console.error('Connection error', e.message)
    })


class db {
    constructor(uri) {
        super();
        this.db = null;
        this.uri = uri
    }

    async initialize() {
        try {
            await mongoose.connect(this.uri, { useNewUrlParser: true });
            this.db = mongoose.connection;
        } catch (error) {
            console.error('Connection error', error.message);
        }
    }

    async close() {
        try {
            await mongoose.connection.close();
        } catch (error) {
            console.error('error disconnecting mongodb: ', error.message);
        }
    }

    //user
    async getUserByEmail(email) {
        return await User.findOne({ email });
    }
    
    async getUserById(id) {
        const user = await User.findById(id);
        if(!user) {
            console.error("User not found");
            return null;
        }

        return user;

    }

    async createUser(userObject) {
        const newUser = new User(userObject);
        return await newUser.save();
    }

    async updateUserById(id, userObject) {
        try {
            return await User.findByIdAndUpdate(id, userObject, { new: true });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async deleteUserById(id) {
        return User.findByIdAndDelete(id);
    }

    async createPlaylist(playlistObject) {
        const createdPlaylist = new Playlist(playlistObject);
        return createdPlaylist.save();
    }

    async deletePlaylistById(id) {
        return Playlist.findByIdAndDelete(id);
    }

    async getPlaylistById(id) {
        const playlist = await Playlist.findById(id);
        
        if(!playlist) {
            console.error("Playlist not found");
            return null;
        }

        return playlist;
    }

    async getAllPlaylists() {
        try {
            return await Playlist.find({});
        } catch (error) {
            console.error('getAllPlaylists error: ', error.message);
            throw error;
        }
    }

    async getPlaylistPairs(ownerEmail) {
        try {
            const playlists = await Playlist.find({ ownerEmail: ownerEmail }, '_id name');
            return playlists.map((playlist) => ({
                _id: playlist._id,
                name: playlist.name,
            }));
        } catch (error) {
            console.error('getPlaylistPairs error: ', error.message);
            throw error;
        }
    }

    async updatePlaylistById(id, playlistObject) {
        return await Playlist.findByIdAndUpdate(id, playlistObject, { new: true });
    }
}

module.exports = db;