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
module.exports = router;
