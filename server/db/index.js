const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Playlist = require("../models/playlist-model");
const User = require("../models/user-model");


mongoose
    .connect('mongodb://127.0.0.1:27017/playlister')
    .catch(e => {
        console.error('Connection error', e.message)
    })

const dbConnection = mongoose.connection;

const db = {
    getUserByEmail: async (email) => {
        try {
            return await User.findOne({ email });
        } catch (error) {
            console.error('Error getting user by email:', error);
            return null;
        }
    },
    
    getUserById: async (id) => {
        try {
            const user = await User.findById(id);
            if(!user) {
                console.error("User not found");
                return null;
            }
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            return null;
        }
    },

    createUser: async (userObject) => {
        try {
            const newUser = new User(userObject);
            return await newUser.save();
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    updateUserById: async (id, userObject) => {
        try {
            return await User.findByIdAndUpdate(id, userObject, { new: true });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    deleteUserById: async (id) => {
        try {
            return await User.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // Playlist functions
    createPlaylist: async (playlistObject) => {
        try {
            const createdPlaylist = new Playlist(playlistObject);
            return await createdPlaylist.save();
        } catch (error) {
            console.error('Error creating playlist:', error);
            throw error;
        }
    },

    deletePlaylistById: async (id) => {
        try {
            return await Playlist.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting playlist:', error);
            throw error;
        }
    },

    getPlaylistById: async (id) => {
        try {
            const playlist = await Playlist.findById(id);
            if(!playlist) {
                console.error("Playlist not found");
                return null;
            }
            return playlist;
        } catch (error) {
            console.error('Error getting playlist by ID:', error);
            return null;
        }
    },

    getAllPlaylists: async () => {
        try {
            return await Playlist.find({});
        } catch (error) {
            console.error('getAllPlaylists error: ', error.message);
            throw error;
        }
    },

    getPlaylistPairs: async (ownerEmail) => {
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
    },

    updatePlaylistById: async (id, playlistObject) => {
        try {
            return await Playlist.findByIdAndUpdate(id, playlistObject, { new: true });
        } catch (error) {
            console.error('Error updating playlist:', error);
            throw error;
        }
    }
}

// Export both the connection and helper functions
module.exports = Object.assign(dbConnection, db);


// deleted userByEmail for redundancy, updates to adhere to specs 2, 3, 4.