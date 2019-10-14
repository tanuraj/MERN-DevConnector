const express = require('express'); //used for express featurs
const router = express.Router(); //used for routing
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

//Use models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    //Find user auth user data
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'image']
        );

        //Check data
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found.' });
        }
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/profile/me
// @desc    Create/update user profile
// @access  Private
router.post(
    '/me',
    [
        auth,
        [
            check('status', 'Please select status')
                .not()
                .isEmpty(),
            check('skills', 'Please select skills')
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

        //Assign variable with req body
        const {
            company,
            website,
            location,
            status,
            skills,
            bio,
            githubusername,
            youtube,
            twitter,
            facebook,
            linkedin,
            instagram
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (status) profileFields.status = status;
        if (bio) profileFields.bio = bio;
        if (githubusername) profileFields.githubusername = githubusername;
        //Set skills array
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        //Set social links
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            //For update
            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            //For create
            profile = new Profile(profileFields);
            await profile.save();
            return res.json(profile);
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }

        console.log(profileFields.skills);
        res.send('Hel');
    }
);

// @route   GET api/profile
// @desc    GET all profile
// @access  Public
router.get('/', async (req, res) => {
    //Find user auth user data
    try {
        const profile = await Profile.find().populate('user', [
            'name',
            'image'
        ]);

        //Check data
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found.' });
        }
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    GET all profile
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    //Find user auth user data
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'image']);

        //Check data
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found.' });
        }
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found.' });
        }

        res.status(500).send('Server error');
    }
});

// @route   DELETE api/profile
// @desc    Delete profile $ user
// @access  Private
router.delete('/', auth, async (req, res) => {
    //Find user auth user data
    try {
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
