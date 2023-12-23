const express = require('express');
const { User } = require('../model/User.model');
const { isAuthenticated } = require('../config/middleware');
const { v4: uuidv4 } = require('uuid');
const { profileupload, postupload, storyupload } = require('../config/multer');
const { unlinkSync } = require('fs');
const { Post } = require('../model/Post.model');
const { Comment } = require('../model/Comment.model');
const bcrypt = require('bcrypt');
const { Story } = require('../model/Story.model');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/login');
})

router.get('/login', (req, res) => {
    res.render('pages/auth/login', { footer: false, success: req.flash('success'), fail: req.flash('fail') });
})

router.get('/register', (req, res) => {
    res.render('pages/auth/register', { footer: false, success: req.flash('success'), fail: req.flash('fail') });
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
})

// *******************************protected route*************************************

router.get('/feed', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    const post = await Post.find().populate("user")
    const storyData = await Story.find().populate("user")
    const story = []

    storyData.forEach(element => {
        if(user.following.includes(element.user._id)){
            story.push(element)
        }
    });

    // return res.send(story)

    res.render('pages/home', { footer: true, user, post , story});
})

router.get('/search', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    res.render('pages/search', { footer: true, data: false, user });
})

router.get('/upload', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    res.render('pages/upload', { footer: true, user });
})

router.get('/upload-story', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    res.render('pages/uploadStory', { footer: true, user });
})

router.get('/profile', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    const post = await Post.find({ user: req.session.user })
    res.render('pages/my-profile', { footer: true, user, post });
})

router.get('/edit-profile', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    res.render('pages/editProfile', { footer: true, user });
})

router.get('/following', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).populate('following')
    res.render('pages/followingList', { footer: true, user });
})

router.get('/follower', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).populate('follower')
    res.render('pages/followerList', { footer: true, user });
})

router.get('/user/:username', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    const searchuser = await User.findOne({ username: req.params.username }).select('-password')
    const searchuserpost = await Post.find({ user: searchuser._id })
    return res.render('pages/profile', { footer: true, user, searchuser, post: searchuserpost });
})


// **************************************post route*****************************************

router.post('/auth/login', async (req, res) => {
    const user = await User.findOne().or([{ username: req.body.username }, { email: req.body.username }, { phone: req.body.username }])
    try {
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                req.session.user = user.id
                // change this route while production
                return res.redirect('/feed')
            }
            else {
                req.flash('fail', 'Incorrect password')
                return res.redirect('/login');
            }
        }
        else {
            req.flash('fail', 'Account doesnt exist with ' + req.body.username)
            return res.redirect('/login')
        }

    } catch (error) {
        return done(error, false);

    }

})

router.post('/auth/register', async (req, res) => {

    const duplicate = await User.find().or([{ username: req.body.username }, { email: req.body.email }])

    if (duplicate.length > 0) {
        req.flash('fail', 'Account already exist')
        return res.redirect('/register')
    }
    else {
        const user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.username = req.body.username;
        user.phone = req.body.phone;

        // hashing password by bcrypt
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(req.body.password, salt);

        user.password = password;

        await user.save();
        req.session.user = user.id
    }
    return res.redirect('/feed')
})

router.post('/update-profile-dp', isAuthenticated, profileupload.single('profile'), async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')

    if (user.profile) {
        unlinkSync(`./public/assets/uploads/profile/${user.profile}`)
    }

    user.profile = req.file.filename
    await user.save()
    return res.redirect('/profile')
})

router.post('/update-profile-detail', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')

    user.name = req.body.name
    user.username = req.body.username
    user.phone = req.body.phone
    user.bio = req.body.bio

    await user.save()
    return res.redirect('/profile')
})

router.post('/upload-post', isAuthenticated, postupload.single('image'), async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    const post = new Post();

    post.caption = req.body.caption
    post.image = req.file.filename
    post.user = user.id

    await post.save()
    return res.redirect('/feed')
})

router.post('/upload-story', isAuthenticated, storyupload.single('image'), async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    const story = new Story();

    story.caption = req.body.caption
    story.image = req.file.filename
    story.user = user.id
    story.status = 'active'
    
    console.log(path.extname(req.file.filename).toLowerCase());

    if(path.extname(req.file.filename).toLowerCase() == ".jpeg" || 
    path.extname(req.file.filename).toLowerCase() == ".jpg" || 
    path.extname(req.file.filename).toLowerCase() == ".png" || 
    path.extname(req.file.filename).toLowerCase() == ".tiff" || 
    path.extname(req.file.filename).toLowerCase() == ".gif") {
        story.type = 'image'
    }
    else if(path.extname(req.file.filename).toLowerCase() == ".mp4" || 
    path.extname(req.file.filename).toLowerCase() == ".m4a"|| 
    path.extname(req.file.filename).toLowerCase() == ".f4v" || 
    path.extname(req.file.filename).toLowerCase() == ".m4b" || 
    path.extname(req.file.filename).toLowerCase() == ".mov") {
        story.type = "video"
    }


    await story.save()
    return res.redirect('/feed')
})

router.post('/get-story', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password')
    const story = await Story.findById(req.body.story_id)

    if(!story.view.includes(user._id)){
        story.view.push(user._id)
        story.save();
    }
    return res.send(story)
})


router.post('/like-post', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user);
    const post = await Post.findById(req.body.post_id);
    let data;

    if (post.like.includes(user.id)) {
        post.like.pop(user.id)
        data = false
    } else {
        post.like.push(user.id)
        data = true
    }
    post.save()

    return res.send(data);
})

router.post('/getcomments', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password');
    const post = await Post.findById(req.body.post_id);
    const comment = await Comment.find({post:req.body.post_id}).populate('user');


    return res.send({comment , post , userid:user._id});
})

router.post('/comment', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password');
    const post = await Post.findById(req.body.post_id); 

    const comment = new Comment()
    
    comment.post = post._id
    comment.user = user._id
    comment.comment = req.body.comment
    comment.save()
    
    return res.send('success')

})

router.post('/likeComment', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password');
    const comment = await Comment.findById(req.body.comment_id);
    let data = "";

    if(comment.like.includes(user._id)){
        comment.like.pop(user._id)
        data = "unliked"
    }
    else{
        comment.like.push(user._id)
        data = "liked"
    }
    
    comment.save();
    return res.send(data)

})


router.post('/get-user', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password');
    const results = await User.find({ username: new RegExp(req.body.query, 'i') });

    let data = {
        result: '',
        query: req.body.query,
    };

    if (results.length > 0) {
        results.forEach(element => {
            data.result += `<div class="flex hover:bg-zinc-800 gap-5 px-2">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-500">
                <img class="w-full h-full object-cover" src="./assets/uploads/profile/${element.profile}" alt="">
            </div>
            <div class="py-2">
                <a href="/user/${element.username}"><p class="text-zinc-300">${element.username}</p></a>
                <p class="text-sm">${element.name}</p>
            </div>
        </div>`
        });
    }


    return res.send(data);
})


router.post('/follow', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user).select('-password');
    const targetuser = await User.findById(req.body.target_user).select('-password');

    if (user.following.includes(req.body.target_user)) {
        // removed to session user following list
        user.following.pop(req.body.target_user)
        user.save()

        // removed to target user follower list
        targetuser.follower.pop(user._id)
        targetuser.save()
        return res.send('removed');

    }
    else {

        // added to session user following list
        user.following.push(req.body.target_user)
        user.save()

        // added to target user follower list
        targetuser.follower.push(user._id)
        targetuser.save()
        return res.send('success');
    }

})


module.exports = router;