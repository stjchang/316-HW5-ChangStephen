import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import authRequestSender from './requests'

const AuthContext = createContext();

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        errorMessage: null
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: null
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    errorMessage: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            default:
                return auth;
        }
    }

    auth.getLoggedIn = async function () {
        const response = await authRequestSender.getLoggedIn();
        if (response.loggedIn !== undefined) {
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: response.loggedIn,
                    user: response.user
                }
            });
        }
    }

    auth.registerUser = async function(userName, email, password, passwordVerify, avatarImage) {
        try{   
            const response = await authRequestSender.registerUser(userName, email, password, passwordVerify, avatarImage);   
            if (response.success) {
                // user must login separately
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: null,
                        loggedIn: false,
                        errorMessage: null
                    }
                })
                // redirect to login screen
                return response;
            }
        } catch(error){
            let errorMessage = "error occurred during reg.";
            if (error.message) {
                errorMessage = error.message;
            } else if (error.data && error.data.errorMessage) {
                errorMessage = error.data.errorMessage;
            }
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: auth.user,
                    loggedIn: false,
                    errorMessage: errorMessage
                }
            })
            throw error; // Re-throw so RegisterScreen can handle it
        }
    }

    auth.loginUser = async function(email, password) {
        try{
            const response = await authRequestSender.loginUser(email, password);
            if (response.success) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.user,
                        loggedIn: true,
                        errorMessage: null
                    }
                })
                history.push("/");
            }
        } catch(error){
            let errorMessage = "Wrong email or password provided.";
            if (error.message) {
                errorMessage = error.message;
            } else if (error.data && error.data.errorMessage) {
                errorMessage = error.data.errorMessage;
            }
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: auth.user,
                    loggedIn: false,
                    errorMessage: errorMessage
                }
            })
        }
    }

    auth.logoutUser = async function() {
        await authRequestSender.logoutUser();
        authReducer( {
            type: AuthActionType.LOGOUT_USER,
            payload: null
        })
        history.push("/");
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };