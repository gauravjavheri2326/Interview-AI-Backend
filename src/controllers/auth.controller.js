const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
}

/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in th request body
 * @access public
 */

const registerUserController = async (req, res) => {
    const {  username, email, password } = req.body

    if(!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUSerAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if(isUSerAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists using this username or email address"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })
    
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    

    res.cookie("token", token, cookieOptions)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name loginUserController
 * @description Login a user, expects email and password in the request body
 * @access public
 */

const loginUserController = async (req, res) => {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if(!user) {
        return res.status(400).json({
            message: "Invalid email"
        })
    }

    const isPasswordExists = await bcrypt.compare(password, user.password)

    if(!isPasswordExists) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}
console.log("NODE_ENV:", process.env.NODE_ENV)

/**
 * @name logoutUserController
 * @description Clear token from user cookie and add token to blacklist
 * @access public
 */

const logoutUserController = async (req, res) => {
    const token = req.cookies.token

    if(token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token", cookieOptions)

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMEController
 * @description Get the current logged in user details
 * @access private
 */
const getMeController = async (req,res) => {
    const user = await userModel.findById(req.user.id)
    
    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}