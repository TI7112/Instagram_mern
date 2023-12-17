const mongoose = require('mongoose');

const postScema = new mongoose.Schema({
    caption: String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    image: String,
    like:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    comment:Array,
}, {
    timestamps: true
})

exports.Post = mongoose.model("post" , postScema);