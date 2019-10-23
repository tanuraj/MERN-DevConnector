const express = require('express'); //used for express featurs
const router = express.Router(); //used for routing
const { check, validationResult } = require('express-validator'); //use for express validation
const gravatar = require('gravatar'); //use for gravatar(user image)
const bcrypt = require('bcryptjs'); //use for password encryption
const jwt = require('jsonwebtoken');
const config = require('config');

//Use models
const User = require('../../models/User');

// @route   POST api/users
// @desc    User registration
// @access  Public
router.post(
	'/',
	[
		//chaeck not empty validation
		check('name', 'Please enter name.')
			.not()
			.isEmpty(),
		check('email', 'Please enter valid email').isEmail(),
		check('password', 'Please enter valid password').isLength({ min: 6 })
	],
	async (req, res) => {
		//Check validattion error
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		//Assign variable with req body
		const { name, email, password } = req.body;

		try {
			/*  Query always return a promise 
                which was handle by .then().catch()
                by using await we handle this 
                For function which return promise we async/await for clear code    
            */
			let user = await User.findOne({ email });

			//See if user exists
			if (user) {
				return res
					.status(400)
					.send({ errors: [{ msg: 'User already exists.' }] });
			}

			//Get user gravatar
			const image = gravatar.url(email, {
				s: '300', //size
				r: 'pg', //rating : pg(make people anything)
				d: 'mm' //default image if user not hav a gravatar
			});

			//Create user instance
			user = new User({
				name,
				email,
				image,
				password
			});

			//Encrypt password using Bcryptjs
			//For encryption we need salt to hashing
			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);

			//save user data
			await user.save();

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
