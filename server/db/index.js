const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Playlist = require("../models/playlist-model");
const User = require("../models/user-model");
const Song = require("../models/song-model");


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
            return await Playlist.findByIdAndUpdate(
                id, 
                { $set: playlistObject }, 
                { new: true, runValidators: true }
            );
        } catch (error) {
            console.error('Error updating playlist:', error);
            throw error;
        }
    },

    getAllSongs: async () => {
        try {
            return await Song.find({});
        } catch (error) {
            console.error('Error getting all songs:', error);
            throw error;
        }
    },

    getSongById: async (id) => {
        try {
            const song = await Song.findById(id);
            if(!song) {
                console.error("Song not found");
                return null;
            }
            return song;
        } catch (error) {
            console.error('Error getting song by ID:', error);
            return null;
        }
    },

    getSongByTitleArtistYear: async (title, artist, year) => {
        try {
            return await Song.findOne({ title, artist, year });
        } catch (error) {
            console.error('Error getting song by title/artist/year:', error);
            return null;
        }
    },

    createSong: async (songObject) => {
        try {
            const newSong = new Song(songObject);
            return await newSong.save();
        } catch (error) {
            console.error('Error creating song:', error);
            throw error;
        }
    },

    updateSongById: async (id, songObject) => {
        try {
            const updated = await Song.findByIdAndUpdate(
                id, 
                { $set: songObject }, 
                { new: true, runValidators: true }
            );

            return updated;
        } catch (error) {
            console.error('Error updating song:', error);
            throw error;
        }
    },

    deleteSongById: async (id) => {
        try {
            return await Song.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting song:', error);
            throw error;
        }
    },

    getSongsByOwner: async (ownerEmail) => {
        try {
            return await Song.find({ ownerEmail });
        } catch (error) {
            console.error('Error getting songs by owner:', error);
            throw error;
        }
    }
}

module.exports = Object.assign(dbConnection, db);


// deleted userByEmail for redundancy, updates to adhere to specs 2, 3, 4.