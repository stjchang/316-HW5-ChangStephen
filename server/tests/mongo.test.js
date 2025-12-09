import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
import mongoose from 'mongoose';
import db from '../db/index.js';
import bcrypt from 'bcryptjs';

const TEST_DB = 'mongodb://127.0.0.1:27017/playlister-test';

let testUser;
let testPlaylist;
let testSong;
let testPlaylist2;

beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    await mongoose.connect(TEST_DB);
    
    const User = mongoose.models.User;
    const Playlist = mongoose.models.Playlist;
    const Song = mongoose.models.Song;
    
    await User.deleteMany({});
    await Playlist.deleteMany({});
    await Song.deleteMany({});
});

afterAll(async () => {
    const User = mongoose.models.User;
    const Playlist = mongoose.models.Playlist;
    const Song = mongoose.models.Song;
    
    await User.deleteMany({});
    await Playlist.deleteMany({});
    await Song.deleteMany({});
    
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});

beforeEach(async () => {
    // Clean up before each test
    const User = mongoose.models.User || require('../models/user-model.js');
    const Playlist = mongoose.models.Playlist || require('../models/playlist-model.js');
    const Song = mongoose.models.Song || require('../models/song-model.js');
    
    await User.deleteMany({});
    await Playlist.deleteMany({});
    await Song.deleteMany({});

const passwordHash = await bcrypt.hash('testpassword', 10);
testUser = await db.createUser({
    userName: 'Stephen Chang',
    email: 'test@example.com',
    passwordHash: passwordHash,
    avatarImage: null,
    playlists: []
});

testSong = await db.createSong({
    title: 'American Pie',
    artist: 'Don McLean',
    year: 2000,
    youTubeId: 'test123',
    ownerEmail: testUser.email,
    listens: 0,
    playlists: []
});

testPlaylist = await db.createPlaylist({
    name: 'Test Playlist',
    ownerEmail: testUser.email,
    songs: [{
        title: testSong.title,
        artist: testSong.artist,
        year: testSong.year,
        youTubeId: testSong.youTubeId,
        ownerEmail: testSong.ownerEmail
    }],
    listenerNames: []
});

testPlaylist2 = await db.createPlaylist({
    name: 'Test Playlist 2',
    ownerEmail: testUser.email,
    songs: [],
    listenerNames: []
});
});

// USER CREATE, GET BY EMAIL, GET BY ID
test('Test #1: Create user', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await db.createUser({
        userName: 'Lebron James',
        email: 'lebron@james.com',
        passwordHash: passwordHash,
        avatarImage: null,
        playlists: []
    });

    expect(user).toBeDefined();
    expect(user.userName).toBe('Lebron James');
    expect(user.email).toBe('lebron@james.com');
});

test('Test #2: Get user by email', async () => {
    const user = await db.getUserByEmail('test@example.com');
    
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
});

test('Test #3: Get user by ID', async () => {
    const userId = testUser._id;
    const user = await db.getUserById(userId);
    
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
});

// PLAYLIST CREATE, GET BY ID, UPDATE, DELETE, GET ALL
test('Test #4: Create playlist', async () => {
    const playlist = await db.createPlaylist({
        name: 'Rap Caviar',
        ownerEmail: testUser.email,
        songs: [],
        listenerNames: []
    });

    expect(playlist).toBeDefined();
    expect(playlist.name).toBe('Rap Caviar');
    expect(playlist.ownerEmail).toBe(testUser.email);
});

test('Test #5: Get playlist by ID', async () => {
    const playlistId = testPlaylist._id;
    const playlist = await db.getPlaylistById(playlistId);
    
    expect(playlist).toBeDefined();
    expect(playlist.name).toBe('Test Playlist');
    expect(playlist.songs.length).toBe(1);
});

test('Test #6: Update playlist', async () => {
    const playlistId = testPlaylist._id;
    const updated = await db.updatePlaylistById(playlistId, {
        name: 'Not Test Playlist'
    });

    expect(updated).toBeDefined();
    expect(updated.name).toBe('Not Test Playlist');
});

test('Test #7: Delete playlist', async () => {
    const playlistId = testPlaylist._id;
    const deleted = await db.deletePlaylistById(playlistId);
    
    expect(deleted).toBeDefined();
    
    const retrieved = await db.getPlaylistById(playlistId);
    expect(retrieved).toBeNull();
});

test('Test #8: Get all playlists', async () => {
    const playlists = await db.getAllPlaylists();
    
    expect(playlists).toBeDefined();
    expect(Array.isArray(playlists)).toBe(true);
    expect(playlists.length).toBeGreaterThan(0);
});

// SONG CREATE, GET BY ID, TITLE, ARTIST, YEAR, UPDATE, UPDATE LISTENS, DELETE, GET ALL, GET BY OWNER
test('Test #9: Create song', async () => {
    const song = await db.createSong({
        title: 'Starry Night',
        artist: 'Vincent Van Gogh',
        year: 1700,
        youTubeId: 'new123',
        ownerEmail: testUser.email,
        listens: 0,
        playlists: []
    });

    expect(song).toBeDefined();
    expect(song.title).toBe('Starry Night');
    expect(song.artist).toBe('Vincent Van Gogh');
    expect(song.year).toBe(1700);
});

// GET SONGS BY ID, TITLE, ARTIST, YEAR
test('Test #10: Get song by ID', async () => {
    const songId = testSong._id;
    const song = await db.getSongById(songId);
    
    expect(song).toBeDefined();
    expect(song.title).toBe('American Pie');
});

test('Test #11: Get song by fields', async () => {
    const song = await db.getSongByTitleArtistYear('American Pie', 'Don McLean', 2000);
    
    expect(song).toBeDefined();
    expect(song.title).toBe('American Pie');
    expect(song.artist).toBe('Don McLean');
    expect(song.year).toBe(2000);
});

test('Test #12: Update song', async () => {
    const songId = testSong._id;
    const updated = await db.updateSongById(songId, {
        title: 'Updated Song Title'
    });

    expect(updated).toBeDefined();
    expect(updated.title).toBe('Updated Song Title');
});

test('Test #13: Update song listens', async () => {
    const songId = testSong._id;
    const updated = await db.updateSongById(songId, {
        listens: 5
    });

    expect(updated).toBeDefined();
    expect(updated.listens).toBe(5);
});

test('Test #14: Delete song', async () => {
    const songId = testSong._id;
    const deleted = await db.deleteSongById(songId);
    
    expect(deleted).toBeDefined();
    
    const retrieved = await db.getSongById(songId);
    expect(retrieved).toBeNull();
});

test('Test #15: Get all songs', async () => {
    const songs = await db.getAllSongs();
    
    expect(songs).toBeDefined();
    expect(Array.isArray(songs)).toBe(true);
});

test('Test #16: Get songs by owner', async () => {
    const songs = await db.getSongsByOwner(testUser.email);
    
    expect(songs).toBeDefined();
    expect(Array.isArray(songs)).toBe(true);
    expect(songs.length).toBeGreaterThan(0);
});

// LISTENER ADD, ADD MULTIPLE LISTENERS, ADD SAME LISTENER TWICE
test('Test #17: Add listener to playlist', async () => {
    const playlistId = testPlaylist2._id;
    const listenerEmail = 'listener1@example.com';
    
    const playlist = await db.getPlaylistById(playlistId);
    if (!playlist.listenerNames) {
        playlist.listenerNames = [];
    }
    if (!playlist.listenerNames.includes(listenerEmail)) {
        playlist.listenerNames.push(listenerEmail);
    }
    
    const updated = await db.updatePlaylistById(playlistId, {
        listenerNames: playlist.listenerNames
    });

    expect(updated).toBeDefined();
    expect(updated.listenerNames).toContain(listenerEmail);
    expect(updated.listenerNames.length).toBe(1);
});

test('Test #18: Add multiple listeners to playlist', async () => {
    const playlistId = testPlaylist2._id;
    const listener1 = 'listener1@example.com';
    const listener2 = 'listener2@example.com';
    
    const playlist = await db.getPlaylistById(playlistId);
    playlist.listenerNames = [listener1, listener2];
    
    const updated = await db.updatePlaylistById(playlistId, {
        listenerNames: playlist.listenerNames
    });

    expect(updated).toBeDefined();
    expect(updated.listenerNames.length).toBe(2);
    expect(updated.listenerNames).toContain(listener1);
    expect(updated.listenerNames).toContain(listener2);
});

test('Test #19: Add same listener twice', async () => {
    const playlistId = testPlaylist2._id;
    const listenerEmail = 'ilistentoyou@gmail.com';
    
    // ADD LISTENER FOR THE FIRST TIME
    let playlist = await db.getPlaylistById(playlistId);
    if (!playlist.listenerNames) {
        playlist.listenerNames = [];
    }
    if (!playlist.listenerNames.includes(listenerEmail)) {
        playlist.listenerNames.push(listenerEmail);
    }
    await db.updatePlaylistById(playlistId, {
        listenerNames: playlist.listenerNames
    });

    // ADD LISTENER AGAIN - SHOULD NOT DUPLICATE
    playlist = await db.getPlaylistById(playlistId);
    if (!playlist.listenerNames.includes(listenerEmail)) {
        playlist.listenerNames.push(listenerEmail);
    }
    const updated = await db.updatePlaylistById(playlistId, {
        listenerNames: playlist.listenerNames
    });

    expect(updated).toBeDefined();
    expect(updated.listenerNames.length).toBe(1); // SHOULD BE 1 STILL
    expect(updated.listenerNames).toContain(listenerEmail);
});

// GET PLAYLIST PAIRS BY OWNER
test('Test #20: Get playlist pairs by owner', async () => {
    const pairs = await db.getPlaylistPairs(testUser.email);
    
    expect(pairs).toBeDefined();
    expect(Array.isArray(pairs)).toBe(true);
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs[0]).toHaveProperty('_id');
    expect(pairs[0]).toHaveProperty('name');
});

// SONG PLAYLISTS ARRAY UPDATED WHEN ADDED TO PLAYLIST, UPDATED WHEN REMOVED FROM PLAYLIST
test('Test #21: playlists array owned by song updated when added to playlist', async () => {
    const newSong = await db.createSong({
        title: 'The Lazy Song',
        artist: 'Bruno Mars',
        year: 2007,
        youTubeId: 'rel123',
        ownerEmail: testUser.email,
        listens: 0,
        playlists: []
    });

    const newPlaylist = await db.createPlaylist({
        name: 'Cool Playlist',
        ownerEmail: testUser.email,
        songs: [{
            title: newSong.title,
            artist: newSong.artist,
            year: newSong.year,
            youTubeId: newSong.youTubeId,
            ownerEmail: newSong.ownerEmail
        }],
        listenerNames: []
    });

    const songId = newSong._id;
    const playlistId = newPlaylist._id;
    await db.updateSongById(songId, {
        playlists: [playlistId]
    });

    const updatedSong = await db.getSongById(songId);
    expect(updatedSong).toBeDefined();
    expect(updatedSong.playlists).toBeDefined();
    expect(Array.isArray(updatedSong.playlists)).toBe(true);
    expect(updatedSong.playlists.length).toBe(1);
    expect(updatedSong.playlists[0].toString()).toBe(playlistId.toString());
});

test('Test #22: playlists array owned by song updated when removed from playlist', async () => {
    const newSong = await db.createSong({
        title: 'The Lazy Song',
        artist: 'Bruno Mars',
        year: 2007,
        youTubeId: 'rel123',
        ownerEmail: testUser.email,
        listens: 0,
        playlists: []
    });

    const newPlaylist = await db.createPlaylist({
        name: 'Cool Playlist',
        ownerEmail: testUser.email,
        songs: [{
            title: newSong.title,
            artist: newSong.artist,
            year: newSong.year,
            youTubeId: newSong.youTubeId,
            ownerEmail: newSong.ownerEmail
        }],
        listenerNames: []
    });

    const songId = newSong._id 
    const playlistId = newPlaylist._id
    
    await db.updateSongById(songId, {
        playlists: [playlistId]
    });

    await db.updateSongById(songId, {
        playlists: []
    });

    const updatedSong = await db.getSongById(songId);
    expect(updatedSong).toBeDefined();
    expect(updatedSong.playlists.length).toBe(0);
});

