const multer = require('multer')
const path = require('path')

const profilestorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets/uploads/profile')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) )
    }
})

const poststorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets/uploads/post')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) )
    }
})

const storystorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets/uploads/story')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) )
    }
})

exports.profileupload = multer({ storage: profilestorage })
exports.postupload = multer({ storage: poststorage })
exports.storyupload = multer({ storage: storystorage })