const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [ true, "Username already exists" ],
        require: true,
    },

    email: {
        type: String,
        unique: [ true, "Account aready exist with this email address" ],
        require: true,
    },

    password: {
        type: String,
        required: true
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel