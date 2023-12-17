const mongoose = require('mongoose');

const userScema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        require: true,
        unique: true,
    },
    phone: String,
    profile: String,
    email: String,
    password: String,
    bio: String,
    follower:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
}, {
    timestamps: true
})

exports.User = mongoose.model("user" , userScema);