// /*
//     This is our http api for all things auth, which we use to 
//     send authorization requests to our back-end API. Note we`re 
//     using the Axios library for doing this, which is an easy to 
//     use AJAX-based library. We could (and maybe should) use Fetch, 
//     which is a native (to browsers) standard, but Axios is easier
//     to use when sending JSON back and forth and it`s a Promise-
//     based API which helps a lot with asynchronous communication.
    
//     @author McKilla Gorilla
// */

// import axios from 'axios'
// axios.defaults.withCredentials = true;
// const api = axios.create({
//     baseURL: 'http://localhost:4000/auth',
// })

// // THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// // REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// // REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// // WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// // WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// // CUSTOM FILTERS FOR QUERIES

// export const getLoggedIn = () => api.get(`/loggedIn/`);
// export const loginUser = (email, password) => {
//     return api.post(`/login/`, {
//         email : email,
//         password : password
//     })
// }
// export const logoutUser = () => api.get(`/logout/`)
// export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
//     return api.post(`/register/`, {
//         firstName : firstName,
//         lastName : lastName,
//         email : email,
//         password : password,
//         passwordVerify : passwordVerify
//     })
// }


const API_BASE = "http://localhost:4000/auth";

// GET /loggedIn
export async function getLoggedIn() {
    const url = `${API_BASE}/loggedIn`;
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
        console.error("getLoggedIn error:", error.message);
        throw error;
    }
}

// POST /login
export async function loginUser(email, password) {
    const url = `${API_BASE}/login`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
            const error = new Error(result.errorMessage || `Response status: ${response.status}`);
            error.data = result;
            throw error;
        }

        return result;

    } catch (error) {
        console.error("log error:", error.message);
        throw error;
    }
}

// GET /logout
export const logoutUser = async () => {
    const url = `${API_BASE}/logout`;
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return { success: true };      
        
    } catch (error) {
        console.error("logoutUser error:", error.message);
        throw error;
    }
}

// POST /register
export const registerUser = async(userName, email, password, passwordVerify, avatarImage) => {
    const url = `${API_BASE}/register`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName, email, password, passwordVerify, avatarImage }),
            credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
            const error = new Error(result.errorMessage || `Response status: ${response.status}`);
            error.data = result;
            throw error;
        }

        return result;

    } catch (error) {
        console.error("registerUser error:", error.message);
        throw error;
    }
}


const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis;