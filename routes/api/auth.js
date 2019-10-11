const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    //Find user auth user data
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth
// @desc    Authenticate User & get token (login)
// @access  Public
router.post(
    '/',
    [
        //chaeck not empty validation
        check('email', 'Please enter valid email').isEmail(),
        check('password', 'Please enter valid password').exists()
    ],
    async (req, res) => {
        //Check validattion error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        //Assign variable with req body
        const { email, password } = req.body;

        try {
            /*  Query always return a promise 
                which was handle by .then().catch()
                by using await we handle this 
                For function which return promise we async/await for clear code    
            */
            let user = await User.findOne({ email });

            //See if user exists
            if (!user) {
                return res
                    .status(400)
                    .send({ errors: [{ msg: 'Invalid credentials' }] });
            }

            //Match user credentials
            const isMatch = bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .send({ errors: [{ msg: 'Invalid credentials' }] });
            }

            //Return jsonwebtoken start
            //create payload
            const payload = {
                user: {
                    id: user.id
                }
            };

            //jwt signin
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {
                    expiresIn: 360000 //ideal expire time is 3600
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.log(err.message);
            return res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
