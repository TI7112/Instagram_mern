const mongoose = require('mongoose');

const connectMongoose = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/instagram')
        .then((e) => { console.log('Connected to mongoDB') })
        .catch((e) => { console.log(e) })
}

module.exports = connectMongoose;