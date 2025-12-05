// /*
//     This is our http api, which we use to send requests to
//     our back-end API. Note we`re using the Axios library
//     for doing this, which is an easy to use AJAX-based
//     library. We could (and maybe should) use Fetch, which
//     is a native (to browsers) standard, but Axios is easier
//     to use when sending JSON back and forth and it`s a Promise-
//     based API which helps a lot with asynchronous communication.
    
//     @author McKilla Gorilla
// */

// import axios from 'axios'
// axios.defaults.withCredentials = true;
// const api = axios.create({
//     baseURL: 'http://localhost:4000/store',
// })

// // THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// // REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// // REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// // WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// // WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// // CUSTOM FILTERS FOR QUERIES
// export const createPlaylist = (newListName, newSongs, userEmail) => {
//     return api.post(`/playlist/`, {
//         // SPECIFY THE PAYLOAD
//         name: newListName,
//         songs: newSongs,
//         ownerEmail: userEmail
//     })
// }
// export const deletePlaylistById = (id) => api.delete(`/playlist/${id}`)
// export const getPlaylistById = (id) => api.get(`/playlist/${id}`)
// export const getPlaylistPairs = () => api.get(`/playlistpairs/`)
// export const updatePlaylistById = (id, playlist) => {
//     return api.put(`/playlist/${id}`, {
//         // SPECIFY THE PAYLOAD
//         playlist : playlist
//     })
// }

const API_BASE = "http://localhost:4000/store";

//Post /playlist
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

//delete /playlist/:id
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

// get /playlist/:id
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

// get /playlistpairs
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

// put /playlist/:id
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

const apis = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylist
}

export default apis
