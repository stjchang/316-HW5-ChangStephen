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
export async function getPlaylistById(id) {
    const url = `${API_BASE}/playlist/${id}`;
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

const apis = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylist,
    getAllPlaylists,
    copyPlaylist
}

export default apis
