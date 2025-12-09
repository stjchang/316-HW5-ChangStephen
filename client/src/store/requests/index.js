const API_BASE = "http://localhost:4000/store";

//POST /playlist
export async function createPlaylist(newListName, newSongs, userEmail) {
    const url = `${API_BASE}/playlist`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newListName,
                songs: newSongs,
                ownerEmail: userEmail,
            }),
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("createPlaylist error:", error.message);
        throw error;
    }
}

//DELETE /playlist/:id
export async function deletePlaylist(id) {
    const url = `${API_BASE}/playlist/${id}`;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("deletePlaylistById error:", error.message);
        throw error;
    }
}

// GET /playlist/:id
export async function getPlaylistById(id, trackListener = false) {
    const url = `${API_BASE}/playlist/${id}${trackListener ? '?trackListener=true' : ''}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("getPlaylistById error:", error.message);
        throw error;
    }
}

//GET /playlistpairs
export async function getPlaylistPairs() {
    const url = `${API_BASE}/playlistpairs`;
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("getPlaylistPairs error:", error.message);
        throw error;
    }
}

//PUT /playlist/:id
export async function updatePlaylist(id, playlist) {
    const playlistId = id || playlist?.id || playlist?._id;
    const url = `${API_BASE}/playlist/${playlistId}`;
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playlist: playlist }),
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();   
        return result;
    } catch (error) {
        console.error("updatePlaylistById error:", error.message);
        throw error;
    }
}

//GET /playlists
export async function getAllPlaylists() {
    const url = `${API_BASE}/playlists`;
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("getAllPlaylists error:", error.message);
        throw error;
    }
}

// POST /playlist/:id/copy 
// deep copy
export async function copyPlaylist(id) {
    const url = `${API_BASE}/playlist/${id}/copy`;
    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.errorMessage || `Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("copyPlaylist error:", error.message);
        throw error;
    }
}

// POST /playlist/:id/song
export async function addSongToPlaylist(playlistId, song) {
    const url = `${API_BASE}/playlist/${playlistId}/song`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ song }),
            credentials: "include",
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.errorMessage || `Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("addSongToPlaylist error:", error.message);
        throw error;
    }
}

// DELETE /playlist/:id/song
export async function removeSongFromPlaylist(playlistId, song) {
    const url = `${API_BASE}/playlist/${playlistId}/song`;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ song }),
            credentials: "include",
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.errorMessage || `Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("removeSongFromPlaylist error:", error.message);
        throw error;
    }
}

// Catalog API functions
export async function getSongById(id) {
    const url = `${API_BASE}/song/${id}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("getSongById error:", error.message);
        throw error;
    }
}


// GET /store/catalog
export async function getAllSongs() {
    const url = `${API_BASE}/catalog`;
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("getAllSongs error:", error.message);
        throw error;
    }
}

// POST /store/song
export async function createSong(title, artist, year, youTubeId) {
    const url = `${API_BASE}/song`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, artist, year, youTubeId }),
            credentials: "include",
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.errorMessage || `Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("createSong error:", error.message);
        throw error;
    }
}

// PUT /store/song/:id
export async function updateSong(id, title, artist, year, youTubeId, listens) {
    const url = `${API_BASE}/song/${id}`;
    const body = {};
    if (title !== undefined) body.title = title;
    if (artist !== undefined) body.artist = artist;
    if (year !== undefined) body.year = year;
    if (youTubeId !== undefined) body.youTubeId = youTubeId;
    if (listens !== undefined) body.listens = listens;
    
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include",
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.errorMessage || `Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("updateSong error:", error.message);
        throw error;
    }
}

// DELETE /store/song/:id
export async function deleteSong(id) {
    const url = `${API_BASE}/song/${id}`;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            credentials: "include",
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.errorMessage || `Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("deleteSong error:", error.message);
        throw error;
    }
}

const apis = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylist,
    getAllPlaylists,
    copyPlaylist,
    addSongToPlaylist,
    getAllSongs,
    createSong,
    updateSong,
    deleteSong,
}

export default apis
