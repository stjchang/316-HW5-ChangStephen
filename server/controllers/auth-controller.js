require('dotenv').config();
const auth = require('../auth');
// const User = require('../models/user-model')
const bcrypt = require('bcryptjs');

const db = require('../db');

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await db.getUserById(userId);
        if(!loggedInUser) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "user not found"
            })
        }

        return res.status(200).json({
            loggedIn: true,
            user: {
                userName: loggedInUser.userName,
                email: loggedInUser.email,
                avatarImage: loggedInUser.avatarImage
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await db.getUserByEmail(email);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        // LOGIN THE USER
        const userId = existingUser._id || existingUser.id;
        const token = auth.signToken(userId);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                userName: existingUser.userName,
                email: existingUser.email,
                avatarImage: existingUser.avatarImage
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            errorMessage: "An error occurred while logging in."
        });
    }
}

logoutUser = async (req, res) => {

    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

registerUser = async (req, res) => {
    try {
        const { userName, email, password, passwordVerify, avatarImage } = req.body;
        if (!userName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        const userData = {
            userName,
            email,
            passwordHash
        };
        
        if (avatarImage) {
            userData.avatarImage = avatarImage;
        }

        const savedUser = await db.createUser(userData);
        return res.status(200).json({
            success: true,
            message: "Account created successfully. Please login."
        })

    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            // (email already exists)
            return res.status(400).json({
                success: false,
                errorMessage: "An account with this email address already exists."
            });
        }
        res.status(500).json({
            success: false,
            errorMessage: "An error occurred while creating the account."
        });
    }
}

editAccount = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: "Unauthorized. Please login to edit your account."
            });
        }

        const { userName, email, password, passwordVerify, avatarImage } = req.body;
        
        const currentUser = await db.getUserById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                errorMessage: "User not found."
            });
        }

        const updateData = {};

        if (userName !== undefined && userName !== null && userName.trim() !== '') {
            updateData.userName = userName.trim();
        }

        if (email !== undefined && email !== null && email.trim() !== '') {
            const trimmedEmail = email.trim();
            if (trimmedEmail !== currentUser.email) {
                const existingUser = await db.getUserByEmail(trimmedEmail);
                if (existingUser && existingUser._id.toString() !== userId.toString()) {
                    return res.status(400).json({
                        success: false,
                        errorMessage: "An account with this email address already exists."
                    });
                }
                updateData.email = trimmedEmail;
            }
        }

        if (password !== undefined && password !== null && password !== '') {
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    errorMessage: "Password must be at least 8 characters."
                });
            }
            if (password !== passwordVerify) {
                return res.status(400).json({
                    success: false,
                    errorMessage: "Passwords do not match."
                });
            }

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            updateData.passwordHash = await bcrypt.hash(password, salt);
        }

        if (avatarImage !== undefined && avatarImage !== null) {
            updateData.avatarImage = avatarImage;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                errorMessage: "No fields to update."
            });
        }

        const updatedUser = await db.updateUserById(userId, updateData);
        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                errorMessage: "Failed to update account."
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                userName: updatedUser.userName,
                email: updatedUser.email,
                avatarImage: updatedUser.avatarImage
            },
            message: "Account updated successfully."
        });

    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            // email alr exists in db so error
            return res.status(400).json({
                success: false,
                errorMessage: "An account with this email address already exists."
            });
        }
        return res.status(500).json({
            success: false,
            errorMessage: "An error occurred while updating the account."
        });
    }
}

getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Email is required'
            });
        }

        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                userName: user.userName,
                email: user.email,
                avatarImage: user.avatarImage
            }
        });
    } catch (err) {
        console.error("getUserByEmail error:", err);
        return res.status(500).json({
            success: false,
            errorMessage: 'Could not retrieve user'
        });
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    editAccount,
    getUserByEmail
}