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
    const userId = auth.verifyUser(req);
    // If guest
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: 'Unauthorized. Please login to create a playlist.'
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
        const user = await db.getUserById(userId)
        if(!user) {
            return res.status(404).json({
                errorMessage: 'User not found'
            })
        }  

        const playlist = await db.createPlaylist(body);
        if (!playlist) {
            return res.status(400).json({ success: false, error: 'Playlist could not be created' })
        }
        const playlistId = playlist._id
        const userObjectId = user._id 
        if (user.playlists) {
            user.playlists.push(playlistId);
            await db.updateUserById(userObjectId, user);
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
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: 'Unauthorized. Please login to delete a playlist.'
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
        if (ownerId.toString() !== userId.toString()) { 
            return res.status(403).json({
                success: false,
                errorMessage: 'Forbidden. You can only delete your own playlists.'
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
    try {
        const playlist = await db.getPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Playlist not found'
            })
        }

        // track listener if user is logged in
        const userId = auth.verifyUser(req);
        if (userId !== null) {
            const user = await db.getUserById(userId);
            if (user && user.email && playlist.listeners) {
                if (!playlist.listeners.includes(user.email)) {
                    playlist.listeners.push(user.email);
                    await db.updatePlaylistById(req.params.id, { listeners: playlist.listeners });
                }
            } else if (user && user.email) {
                await db.updatePlaylistById(req.params.id, { listeners: [user.email] });
            }
        }

        return res.status(200).json({
            success: true,
            playlist: playlist
        });
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
        return res.status(401).json({
            success: false,
            errorMessage: 'Unauthorized. Please login to view your playlists.'
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

    try {
        const playlists = await db.getAllPlaylists();
        if (!playlists || playlists.length === 0) {
            return res.status(200).json({
                success: true, 
                data: []
            })
        }
        return res.status(200).json({ 
            success: true, 
            data: playlists
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not retrieve playlists'
        });
    }
}
const updatePlaylist = async (req, res) => {
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: 'Unauthorized. Please login to edit a playlist.'
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

        const ownerId = owner._id;
        if (ownerId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                errorMessage: 'Forbidden. You can only edit your own playlists.'
            })
        }

        const playlistData = body.playlist || body;
        const updatedPlaylist = {
            name: playlistData.name,
            songs: playlistData.songs,
            ownerEmail: existingPlaylist.ownerEmail,
            listeners: existingPlaylist.listeners || []
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

const copyPlaylist = async (req, res) => {
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: ' Login to copy a playlist.'
        })
    }

    try {
        const originalPlaylist = await db.getPlaylistById(req.params.id);
        if (!originalPlaylist) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Playlist not found'
            })
        }

        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found'
            })
        }

        const copiedPlaylistData = {
            name: "Copy of " + originalPlaylist.name,
            ownerEmail: user.email,
            songs: originalPlaylist.songs.map(song => ({
                title: song.title,
                artist: song.artist,
                year: song.year,
                youTubeId: song.youTubeId,
                ownerEmail: song.ownerEmail
            }))
        };

        const newPlaylist = await db.createPlaylist(copiedPlaylistData);
        if (!newPlaylist) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Playlist could not be copied'
            })
        }

        const playlistId = newPlaylist._id;
        const userObjectId = user._id;

        if (user.playlists) {
            user.playlists.push(playlistId);
            await db.updateUserById(userObjectId, user);
        }

        return res.status(201).json({
            success: true,
            playlist: newPlaylist
        });
        
    } catch (error) {
        console.error("copyPlaylist error:", error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not copy playlist'
        });
    }
}

const addSongToPlaylist = async (req, res) => {
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: 'Login to add songs to a playlist.'
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

        // check if user owns the playlist
        const owner = await db.getUserByEmail(playlist.ownerEmail);
        if (!owner) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Owner not found'
            })
        }

        const ownerId = owner._id;
        if (ownerId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                errorMessage: 'You can only add songs to your own playlists'
            })
        }

        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found'
            })
        }

        const { song } = req.body;
        if (!song || !song.title || !song.artist || song.year === undefined) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Song data is required'
            })
        }

        const isDuplicate = playlist.songs.some(s => s.title === song.title && s.artist === song.artist 
            && s.year === song.year
        );

        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                errorMessage: 'This song already exists in the playlist'
            })
        }

        const newSong = {
            title: song.title,
            artist: song.artist,
            year: song.year,
            youTubeId: song.youTubeId || '',
            ownerEmail: song.ownerEmail || user.email
        };

        const updatedSongs = [...(playlist.songs || []), newSong];
        const updatedPlaylist = {
            name: playlist.name,
            songs: updatedSongs,
            ownerEmail: playlist.ownerEmail,
            listeners: playlist.listeners || []
        };

        const result = await db.updatePlaylistById(req.params.id, updatedPlaylist);

        return res.status(200).json({
            success: true,
            playlist: result
        });

    } catch (error) {
        console.error("addSongToPlaylist error:", error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not add song to playlist'
        });
    }
}


module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist,
    copyPlaylist,
    addSongToPlaylist
}