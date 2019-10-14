const express = require('express'); //used for express featurs
const router = express.Router(); //used for routing
const auth = require('../../middleware/auth');

//Use models
const Profile = require('../../models/Profile');

// @route   GET api/profile
// @desc    Test route
// @access  Private
router.get('/', auth, async (req, res) => {
    //Find user auth user data
    try {
        const profile = await Profile.findOne({ user_id: req.user.id });
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
