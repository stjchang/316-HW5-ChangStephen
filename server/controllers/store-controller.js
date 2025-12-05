// const Playlist = require('../models/playlist-model')
// const User = require('../models/user-model');
require('dotenv').config();
const auth = require('../auth')
const db = require('../db');

/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
const createPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }

    try {
        const user = await db.getUserById(req.userId)
        if(!user) {
            return res.status(404).json({
                errorMessage: 'User not found'
            })
        }  

        const playlist = await db.createPlaylist(body);
        if (!playlist) {
            return res.status(400).json({ success: false, error: 'Playlist could not be created' })
        }
        const playlistId = playlist._id || playlist.id;
        const userId = user._id || user.id;
        if (user.playlists) {
            user.playlists.push(playlistId);
            await db.updateUserById(userId, user);
        }

        return res.status(201).json({
            playlist: playlist
        })
    } catch (error) {
        return res.status(500).json({
            errorMessage: 'playlist could not be created'
        })
    }
}

const deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const playlist = await db.getPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            })
        }

        const owner = await db.getUserByEmail(playlist.ownerEmail);
        if (!owner) {
            return res.status(404).json({
                errorMessage: 'Owner not found'
            })
        }

        const ownerId = owner._id || owner.id;
        if (ownerId != req.userId) { 
            return res.status(400).json({
                errorMessage: 'Authentication error'
            })
        }

        const deletedPlaylist = await db.deletePlaylistById(req.params.id);
        if (!deletedPlaylist) {
            return res.status(500).json({
                errorMessage: 'Playlist could not be deleted'
            })
        }
        return res.status(200).json({});
    } catch (error) {
        return res.status(500).json({
            errorMessage: 'Could not delete playlist'
        });
    }    

}

const getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const playlist = await db.getPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Playlist not found'
            })
        }

        const user = await db.getUserByEmail(playlist.ownerEmail);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found'
            })
        }

        const userId = user._id || user.id;

        if (userId == req.userId) {
            return res.status(200).json({
                success: true,
                playlist: playlist
            });
        }
        else {
            return res.status(400).json({ 
                success: false,
                errorMessage: "authentication error" 
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not retrieve playlist'
        });
    }
}
const getPlaylistPairs = async (req, res) => {
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                errorMessage: 'User not found'
            })
        }
        
        if (!user.email) {
            return res.status(500).json({
                success: false,
                errorMessage: 'User email not found'
            });
        }
        
        const pairs = await db.getPlaylistPairs(user.email);

        if(!pairs || pairs.length === 0) {
            return res.status(200).json({
                success: true, 
                idNamePairs: []
            });
        }

        return res.status(200).json({success: true, idNamePairs: pairs });
    } catch (error) {
        console.error("getPlaylistPairs error:", error);
        return res.status(500).json({   
            success: false,
            errorMessage: 'Could not retrieve playlist pairs'
        });
    }
}
const getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const playlists = await db.getAllPlaylists();
    if (!playlists || playlists.length === 0) {
        return res.status(404).json({
            sucess: false, 
            errorMessage: 'Playlists not found '
        })
    }
    return res.status(200).json({ success: true, data: playlists});

}
const updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body

    try {
        const existingPlaylist = await db.getPlaylistById(req.params.id);
        if (!existingPlaylist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            })
        }

        const owner = await db.getUserByEmail(existingPlaylist.ownerEmail);
        if (!owner) {
            return res.status(404).json({
                errorMessage: 'User not found'
            })
        }

        const userId = auth.verifyUser(req);
        const ownerId = owner._id || owner.id;
        if (ownerId != userId) {
            return res.status(400).json({
                errorMessage: 'Authentication error'
            })
        }

        const playlistData = body.playlist || body;
        const updatedPlaylist = {
            name: playlistData.name,
            songs: playlistData.songs,
            ownerEmail: existingPlaylist.ownerEmail
        };

        await db.updatePlaylistById(req.params.id, updatedPlaylist);

        return res.status(200).json({   
            success: true,
            playlist: updatedPlaylist
        });
    } catch (error) {
        return res.status(500).json({   
            success: false,
            errorMessage: 'Could not update playlist'
        });
    }

    
}
module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}