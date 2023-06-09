const asyncHandler = require("express-async-handler");
const User = require("../models/bizModel");
const generateToken = require("../config/utility");
const Wallet = require("./../models/walletModel");


const register = asyncHandler(async (req, res) => {
	const { organization, email, password, category } = req.body;

	if (!organization || !email || !password) {
		res.status(400);
		throw new Error("Please Enter all the fields");
	}

	const userExists = await User.findOne({ email });
    console.log(userExists);
	if (userExists) {
		res.status(400);
		throw new Error("User already Exists");
	}

	const user = await User.create({
		organization,
		email,
		password,
        category
	});

	if (user) {
        const wallet = await Wallet.findOne({ userID: user._id });
    
        res.status(201).json({
          _id: user._id,
          merchant: user.organization,
          email: user.email,
          balance: wallet.balance,
          token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Failed to create a user");
    }
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (user && (await user.matchPassword(password))) {
        const wallet = await Wallet.findOne({ userID: user._id });
		res.status(200);
		res.json({
			_id: user._id,
			merchant: user.organization,
			email: user.email,
            balance:  wallet.balance,
			token: generateToken(user._id),
		});
	} else {
		res.status(401);
		throw new Error("Invalid Email or Password");
	}
});



module.exports = { register, login};


// module.exports = {
//     login,
//     register
// }
