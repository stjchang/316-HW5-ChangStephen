const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
dotenv.config();

const Song = require('../models/song-model');
const User = require('../models/user-model');
const Playlist = require('../models/playlist-model');

let SONGS_TO_IMPORT = 50;


mongoose
    .connect('mongodb://127.0.0.1:27017/playlister')
    .catch(e => {
        console.error('Connection error', e.message);
        process.exit(1);
    });

const dbConnection = mongoose.connection;

dbConnection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

dbConnection.once('open', async () => {
    console.log('Connected to MongoDB');
    
    try {
        // DELETE
        console.log('Deleting all existing data...');
        
        await User.deleteMany({});
        await Song.deleteMany({});
        await Playlist.deleteMany({});
        
        console.log('Reset complete.\n');
        
        // LOAD JSON
        const jsonPath = path.join(__dirname, 'data/PlaylisterData.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        console.log(`Found ${jsonData.users.length} users`);
        console.log(`Found ${jsonData.playlists.length} playlists`);
        

        const userEmailMap = new Map(); 
        let usersImported = 0;
        let usersSkipped = 0;
        let usersErrors = 0;

        
        const defaultPassword = 'aaaaaaaa';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        
        // USERS

        for (const userData of jsonData.users) {
            try {
                const existingUser = await User.findOne({ email: userData.email });
                
                if (existingUser) {
                    userEmailMap.set(userData.email, existingUser._id);
                    usersSkipped++;
                    continue;
                }
                
                const newUser = new User({
                    userName: userData.name,
                    email: userData.email,
                    passwordHash: passwordHash,
                    avatarImage: null,
                    playlists: []
                });
                
                const savedUser = await newUser.save();
                userEmailMap.set(userData.email, savedUser._id);
                usersImported++;
                
            } catch (error) {
                if (error.code === 11000) {
                    const existingUser = await User.findOne({ email: userData.email });
                    if (existingUser) {
                        userEmailMap.set(userData.email, existingUser._id);
                    }
                    usersSkipped++;
                } else {
                    usersErrors++;
                }
            }
        }
        
        
        const songMap = new Map(); 
        const songKeyToIdMap = new Map(); 

        // SONGS
        jsonData.playlists.forEach((playlist) => {
            if (playlist.songs && Array.isArray(playlist.songs)) {
                playlist.songs.forEach((song) => {
                    const songKey = `${song.title}|${song.artist}|${song.year}`;
                    
                    if (!songMap.has(songKey)) {
                        songMap.set(songKey, {
                            title: song.title,
                            artist: song.artist,
                            year: song.year,
                            youTubeId: song.youTubeId,
                            ownerEmail: playlist.ownerEmail || jsonData.users[0]?.email || 'admin@playlister.com',
                            listens: 0,
                            playlists: []
                        });
                    }
                });
            }
        });
        
        
        let songsImported = 0;
        let songsSkipped = 0;
        let songsErrors = 0;

        for (const [songKey, songData] of songMap) {
            if (songsImported >= SONGS_TO_IMPORT) {
                break;
            }
            try {
                const existingSong = await Song.findOne({
                    title: songData.title,
                    artist: songData.artist,
                    year: songData.year
                });
                
                if (existingSong) {
                    songKeyToIdMap.set(songKey, existingSong._id);
                    songsSkipped++;
                    continue;
                }
                
                const newSong = new Song(songData);
                const savedSong = await newSong.save();
                songKeyToIdMap.set(songKey, savedSong._id);
                songsImported++;
                
            } catch (error) {
                if (error.code === 11000) {
                    const existingSong = await Song.findOne({
                        title: songData.title,
                        artist: songData.artist,
                        year: songData.year
                    });
                    if (existingSong) {
                        songKeyToIdMap.set(songKey, existingSong._id);
                    }
                    songsSkipped++;
                } else {
                    songsErrors++;
                }
            }
        }
        

        // PLAYLISTS
        let playlistsImported = 0;
        let playlistsSkipped = 0;
        let playlistsErrors = 0;

        for (const playlistData of jsonData.playlists) {
            try {
                const existingPlaylist = await Playlist.findOne({
                    name: playlistData.name,
                    ownerEmail: playlistData.ownerEmail
                });
                
                if (existingPlaylist) {
                    playlistsSkipped++;
                    continue;
                }
                
                const mappedSongs = [];
                if (playlistData.songs && Array.isArray(playlistData.songs)) {
                    for (const song of playlistData.songs) {
                        const songKey = `${song.title}|${song.artist}|${song.year}`;
                        const songId = songKeyToIdMap.get(songKey);
                        
                        if (songId) {
                            const songDoc = await Song.findById(songId);
                            if (songDoc) {
                                mappedSongs.push({
                                    title: songDoc.title,
                                    artist: songDoc.artist,
                                    year: songDoc.year,
                                    youTubeId: songDoc.youTubeId,
                                    ownerEmail: songDoc.ownerEmail
                                });
                            }
                        }
                    }
                }
                
                const newPlaylist = new Playlist({
                    name: playlistData.name,
                    ownerEmail: playlistData.ownerEmail,
                    songs: mappedSongs,
                    listenerNames: []
                });
                
                const savedPlaylist = await newPlaylist.save();
                playlistsImported++;
                
                // include playlists in song playlists array
                if (mappedSongs.length > 0) {
                    for (const song of playlistData.songs) {
                        const songKey = `${song.title}|${song.artist}|${song.year}`;
                        const songId = songKeyToIdMap.get(songKey);
                        
                        if (songId) {
                            try {
                                const songDoc = await Song.findById(songId);
                                if (songDoc) {
                                    if (!songDoc.playlists || !songDoc.playlists.includes(savedPlaylist._id)) {
                                        if (!songDoc.playlists) {
                                            songDoc.playlists = [];
                                        }
                                        songDoc.playlists.push(savedPlaylist._id);
                                        await songDoc.save();
                                    }
                                }
                            } catch (songUpdateError) {
                            }
                        }
                    }
                }
                
            } catch (error) {
                playlistsErrors++;
            }
        }
                
        console.log('\nImport Statistics');
        console.log(`Users - Imported: ${usersImported}, Skipped: ${usersSkipped}, Errors: ${usersErrors}`);
        console.log(`Songs - Imported: ${songsImported}, Skipped: ${songsSkipped}, Errors: ${songsErrors}`);
        console.log(`Playlists - Imported: ${playlistsImported}, Skipped: ${playlistsSkipped}, Errors: ${playlistsErrors}`);
        console.log('\ All imported users have default password: "aaaaaaaa"');
        
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
        process.exit(0);
        
    } catch (error) {
        console.error('Error during import:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
});

