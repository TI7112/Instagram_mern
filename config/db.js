const mongoose = require('mongoose');
require('dotenv').config()


const connectMongoose = () => {
    mongoose.connect(`${process.env.MONGO_URI}`)
        .then((e) => { console.log('Connected to mongoDB') })
        .catch((e) => { console.log(e) })
}

module.exports = connectMongoose;