const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth-controller')
const auth = require('../auth')

router.post('/register', AuthController.registerUser)
router.post('/login', AuthController.loginUser)
router.get('/logout', AuthController.logoutUser)
router.get('/loggedIn', AuthController.getLoggedIn)
router.put('/edit', auth.verify, AuthController.editAccount)
router.get('/user/:email', AuthController.getUserByEmail)

module.exports = router