const express = require('express'); //used for express featurs
const router = express.Router(); //used for routing
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

//Use models
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    Create a posts
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('text', 'Please enter message')
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        //Check validattion error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');

            //Assign variable with req body
            const postField = new Post({
                text: req.body.text,
                name: user.name,
                image: user.image,
                user: req.user.id
            });

            const post = await postField.save();
            res.json(post);
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/posts
// @desc    GET all posts
// @access  Public
router.get('/', auth, async (req, res) => {
    //Find posts data
    try {
        const posts = await Post.find().sort({ date: -1 });

        //Check data
        if (!posts) {
            return res.status(400).json({ msg: 'Posts not found.' });
        }
        res.json(posts);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/posts/:post_id
// @desc    GET aaaaaall profile
// @access  Public
router.get('/:post_id', auth, async (req, res) => {
    //Find posts data
    try {
        const posts = await Post.findById(req.params.post_id).sort({
            date: -1
        });

        //Check data
        if (!posts) {
            return res.status(400).json({ msg: 'Posts not found.' });
        }
        res.json(posts);
    } catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Posts not found.' });
        }
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/posts/:post_id
// @desc    Delete user posts
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        //Find post data
        const post = await Post.findById(req.params.post_id);

        //Check for post exist
        if (!post) {
            return res.status(400).json({ msg: 'Posts not found.' });
        }

        //check post for valid user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized.' });
        }
        await post.remove();
        res.json({ msg: 'Post deleted' });
    } catch (err) {
        console.log(err.message);

        res.status(500).send('Server error');
    }
});

module.exports = router;
