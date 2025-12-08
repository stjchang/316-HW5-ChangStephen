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

        // track listenerNames if user is logged in
        const userId = auth.verifyUser(req);
        if (userId !== null) {
            const user = await db.getUserById(userId);
            if (user && user.email && playlist.listenerNamess) {
                if (!playlist.listenerNamess.includes(user.email)) {
                    playlist.listenerNamess.push(user.email);
                    await db.updatePlaylistById(req.params.id, { listenerNamess: playlist.listenerNamess });
                }
            } else if (user && user.email) {
                await db.updatePlaylistById(req.params.id, { listenerNamess: [user.email] });
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
            listenerNamess: existingPlaylist.listenerNamess || []
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
            listenerNamess: playlist.listenerNamess || []
        };

        const result = await db.updatePlaylistById(req.params.id, updatedPlaylist);

        try {
            const catalogSong = await db.getSongByTitleArtistYear(song.title, song.artist, song.year);
            if (catalogSong) {
                const playlistId = result._id;
                if (!catalogSong.playlists || !catalogSong.playlists.includes(playlistId)) {
                    // spread existing playlists with new playlist id or create new playlist and spread to added playlist id
                    const updatedPlaylists = [...(catalogSong.playlists || []), playlistId];
                    await db.updateSongById(catalogSong._id, { playlists: updatedPlaylists });
                }
            }
        } catch (error) {
            // dont fail since we should still add song to playlist if song is not in catalog
            console.error("Error updating song catalog:", error);
            
        }

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

const removeSongFromPlaylist = async (req, res) => {
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: 'Login to remove songs from a playlist.'
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
                errorMessage: 'You can only remove songs from your own playlists'
            })
        }

        const { song } = req.body;
        if (!song || !song.title || !song.artist || song.year === undefined) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Song data is required'
            })
        }


        // filter anything that isn't the song to remove
        const updatedSongs = (playlist.songs).filter(s => 
            !(s.title === song.title && s.artist === song.artist && s.year === song.year)
        );

        const updatedPlaylist = {
            name: playlist.name,
            songs: updatedSongs,
            ownerEmail: playlist.ownerEmail,
            listeners: playlist.listeners || []
        };

        const result = await db.updatePlaylistById(req.params.id, updatedPlaylist);

        // remove this playlist from the song's playlists array
        try {
            const catalogSong = await db.getSongByTitleArtistYear(song.title, song.artist, song.year);
            if (catalogSong && catalogSong.playlists) {
                const playlistId = result._id;
                const updatedPlaylists = catalogSong.playlists.filter(
                    pid => pid.toString() !== playlistId.toString()
                );
                await db.updateSongById(catalogSong._id, { playlists: updatedPlaylists });
            }
        } catch (error) {
            console.error("Error updating song catalog:", error);
            return res.status(500).json({
                success: false,
                errorMessage: 'Could not remove song from playlist'
            });
        }

        return res.status(200).json({
            success: true,
            playlist: result
        });

    } catch (error) {
        console.error("removeSongFromPlaylist error:", error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not remove song from playlist'
        });
    }
}


// -------------------------- SONGS CATALOG FUNCTIONS --------------------------
const getAllSongs = async (req, res) => {
    try {
        const songs = await db.getAllSongs();
        return res.status(200).json({
            success: true,
            data: songs || []
        });
    } catch (error) {
        console.error("getAllSongs error:", error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not retrieve songs'
        });
    }
}

const createSong = async (req, res) => {
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: 'Login to add songs to catalog.'
        })
    }

    try {
        const { title, artist, year, youTubeId } = req.body;
        
        if (!title || !artist || year === undefined || !youTubeId) {
            return res.status(400).json({
                success: false,
                errorMessage: 'all fields are required'
            });
        }

        const user = await db.getUserById(userId);
        if (!user || !user.email) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found'
            });
        }

        const existingSong = await db.getSongByTitleArtistYear(title, artist, year);
        if (existingSong) {
            return res.status(400).json({
                success: false,
                errorMessage: 'A song with this title, artist, and year already exists in the catalog.'
            });
        }

        const songData = {
            title: title.trim(),
            artist: artist.trim(),
            year: parseInt(year),
            youTubeId: youTubeId.trim(),
            ownerEmail: user.email,
            listens: 0,
            playlists: []
        };

        const newSong = await db.createSong(songData);
        
        return res.status(201).json({
            success: true,
            song: newSong
        });

    } catch (error) {
        console.error("createSong error:", error);
        // dupicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                errorMessage: 'A song with this title, artist, and year already exists.'
            });
        }
        return res.status(500).json({
            success: false,
            errorMessage: 'failed to add song to catalog'
        });
    }
}

const updateSong = async (req, res) => {
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: 'login to edit songs.'
        })
    }

    try {
        const songId = req.params.id;
        const existingSong = await db.getSongById(songId);
        
        if (!existingSong) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }

        const user = await db.getUserById(userId);
        if (!user || user.email !== existingSong.ownerEmail) {
            return res.status(403).json({
                success: false,
                errorMessage: 'You can only edit songs you added to the catalog.'
            });
        }

        const { title, artist, year, youTubeId } = req.body;
        
        // check for duplicate
        if (title && artist && year !== undefined) {
            const duplicate = await db.getSongByTitleArtistYear(title, artist, year);
            if (duplicate && duplicate._id.toString() !== songId) {
                return res.status(400).json({
                    success: false,
                    errorMessage: 'Duplicate song exists in catalogg.'
                });
            }
        }

        const dataToUpdate = {};
        if (title !== undefined) {
            dataToUpdate.title = title.trim();
        }
        if (artist !== undefined) {
            dataToUpdate.artist = artist.trim();
        }
        if (year !== undefined) {
            dataToUpdate.year = parseInt(year);
        }
        if (youTubeId !== undefined) {
            dataToUpdate.youTubeId = youTubeId.trim();
        }

        const updatedSong = await db.updateSongById(songId, dataToUpdate);
        
        // update every song in playlists that contain the song
        if (existingSong.playlists && existingSong.playlists.length > 0) {
            // for every song in the playlist, update the song with dataToUpdate
            for (const playlistId of existingSong.playlists) {
                const playlist = await db.getPlaylistById(playlistId);
                if (playlist && playlist.songs) {
                    const updatedSongs = playlist.songs.map(song => {
                        // match by title, artist, year
                        if (song.title === existingSong.title && 
                            song.artist === existingSong.artist && 
                            song.year === existingSong.year) {
                            return {
                                ...song,
                                title: dataToUpdate.title || song.title,
                                artist: dataToUpdate.artist || song.artist,
                                year: dataToUpdate.year !== undefined ? dataToUpdate.year : song.year,
                                youTubeId: dataToUpdate.youTubeId || song.youTubeId
                            };
                        }
                        return song;
                    });
                    
                    await db.updatePlaylistById(playlistId, {
                        name: playlist.name,
                        songs: updatedSongs,
                        ownerEmail: playlist.ownerEmail,
                        listenerNamess: playlist.listenerNamess || []
                    });
                }
            }
        }

        return res.status(200).json({
            success: true,
            song: updatedSong
        });

    } catch (error) {
        console.error("updateSong error:", error);
        // duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Duplicate song exists in the catalog.'
            });
        }
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not update song'
        });
    }
}

const deleteSong = async (req, res) => {
    const userId = auth.verifyUser(req);
    if(userId === null){
        return res.status(401).json({
            success: false,
            errorMessage: 'Please login to remove songs.'
        })
    }

    try {
        const songId = req.params.id;
        const song = await db.getSongById(songId);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'song not found'
            });
        }

        if (!user || user.email !== song.ownerEmail) {
            return res.status(403).json({
                success: false,
                errorMessage: 'You can only remove songs you added to the catalog.'
            });
        }

        if (song.playlists && song.playlists.length > 0) {
            for (const playlistId of song.playlists) {
                const playlist = await db.getPlaylistById(playlistId);
                if (playlist && playlist.songs) {
                    const filteredSongs = playlist.songs.filter(s => 
                        !(s.title === song.title && s.artist === song.artist &&  s.year === song.year)
                    );
                    
                    await db.updatePlaylistById(playlistId, {
                        name: playlist.name,
                        songs: filteredSongs,
                        ownerEmail: playlist.ownerEmail,
                        listenerNamess: playlist.listenerNamess || []
                    });
                }
            }
        }

        // del the song from catalog
        await db.deleteSongById(songId);

        return res.status(200).json({
            success: true,
            message: 'Song removed from catalog and all playlists including it'
        });

    } catch (error) {
        console.error("deleteSong error:", error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not remove song'
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
    addSongToPlaylist,
    removeSongFromPlaylist,
    getAllSongs,
    createSong,
    updateSong,
    deleteSong
}