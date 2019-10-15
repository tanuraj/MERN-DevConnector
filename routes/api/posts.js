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

// @route   PUT api/posts/like/:id
// @desc    Add like of posts
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Check user is already liked post
        if (
            post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
        ) {
            return res.status(400).json({ msg: 'Posts already liked.' });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post);
    } catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Posts not found.' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT api/posts/unlike/:id
// @desc    Add unlike of posts
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Check user is already liked post
        if (
            post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
        ) {
            return res.status(400).json({ msg: 'Post has been not liked.' });
        }

        //Get remove index
        const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post);
    } catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Posts not found.' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST api/posts/comment/:id
// @desc    Create commont on a posts
// @access  Private
router.post(
    '/comment/:id',
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
            const post = await Post.findById(req.params.id);

            //Assign variable with req body
            const commentField = {
                text: req.body.text,
                name: user.name,
                image: user.image,
                user: req.user.id
            };

            post.comments.unshift(commentField);
            await post.save();
            res.json(post);
        } catch (error) {
            console.log(error.message);
            if (error.kind == 'ObjectId') {
                return res.status(400).json({ msg: 'Posts not found.' });
            }
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete user posts
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        //Find post data
        const post = await Post.findById(req.params.id);

        //Pull comment
        const comment = post.comments.find(
            comment => comment.id === req.params.comment_id
        );

        //Check for post exist
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found.' });
        }

        //Check comment for valid user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized.' });
        }

        //Get remove index
        const removeIndex = post.comments
            .map(comment => comment.user.toString())
            .indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);
        await post.save();

        res.json(post);
    } catch (err) {
        console.log(err.message);

        res.status(500).send('Server error');
    }
});

module.exports = router;
