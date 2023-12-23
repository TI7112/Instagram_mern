const mongoose = require('mongoose');

const storyScema = new mongoose.Schema({
    caption: String,
    image: String,
    type: String,
    status: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    view: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
}, {
    timestamps: true
})

exports.Story = mongoose.model("story", storyScema);