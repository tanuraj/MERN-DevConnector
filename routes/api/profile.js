const express = require('express'); //used for express featurs
const router = express.Router(); //used for routing
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('request'); // Use for creare request from github for repos
const config = require('config'); // for using credential of github

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
    '/',
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
            const ismultiple = skills.indexOf(",");
            profileFields.skills = ismultiple >= 0 ? skills.split(',').map(skill => skill.trim()):skills;
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

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Please enter title')
                .not()
                .isEmpty(),
            check('company', 'Please enter company')
                .not()
                .isEmpty(),
            check('from', 'Please enter from date')
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
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        //Build experince object
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };

        //Save user experience
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete profile $ user
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    //Find user auth user data
    try {
        //Get profile
        const profile = await Profile.findOne({ user: req.user.id });

        //Get removed index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        // Remove index
        if (removeIndex >= 0) {
            profile.experience.splice(removeIndex, 1);
        }

        //Again save profile
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'Please enter school name.')
                .not()
                .isEmpty(),
            check('degree', 'Please enter degree.')
                .not()
                .isEmpty(),
            check('fieldofstudy', 'Please enter field of study.')
                .not()
                .isEmpty(),
            check('from', 'Please enter from date')
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
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        //Build experince object
        const newExp = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        };

        //Save user education
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(newExp);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete profile $ user education
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    //Find user auth user data
    try {
        //Get profile
        const profile = await Profile.findOne({ user: req.user.id });

        //Get removed index
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);

        // Check remove index is exist or not and if exists then Remove index
        if (removeIndex >= 0) {
            profile.education.splice(removeIndex, 1);
        }

        //Again save profile
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/profile/github/:username
// @desc    Get user repositories fro github
// @access  Public
router.get('/github/:username', (req, res) => {
    try {
        const option = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${config.get(
                'githubClientId'
            )}&client_secret=${config.get('githubClientSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(option, (error, response, body) => {
            //Check for error
            if (error) console.log(error);

            //Check for valid response(200)
            if (response.statusCode != 200) {
                return res.status(404).json({ msg: 'No github profie found' });
            }

            res.json(JSON.parse(body));
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
});
module.exports = router;
