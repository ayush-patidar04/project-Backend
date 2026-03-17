const mongoose = require("mongoose")

const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required to be blacklisted"] 
    }, 
    
}, {
    timestamps: true
})

const tokenBlackListModel = mongoose.model("blackListToken", blackListTokenSchema)

module.exports = tokenBlackListModel