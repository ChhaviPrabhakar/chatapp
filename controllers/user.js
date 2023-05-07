const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function isStringInvalid(string) {
    if (string == undefined || string.length === 0) {
        return true;
    } else {
        return false;
    }
}

exports.signup = async (req, res, next) => {
    try {
        const { name, email, mobile, password, confirmPassword } = req.body;

        if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(mobile) || isStringInvalid(password)) {
            return res.status(400).json({ err: "Something is missing!" });
        }

        if (password !== confirmPassword) {
            return res.status(401).json({ err: "Password does not match!" });
        }

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            try {
                const data = await User.create({
                    name: name,
                    email: email,
                    mobile: mobile,
                    password: hash
                });
                res.status(201).json({ message: 'Successfully Signed Up' });
            } catch (err) {
                console.log(err);
                return res.status(403).json({ err: "User already exist!" });
            }
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const generateAccessToken = (id) => {
    return jwt.sign({ userId: id }, process.env.TOKEN_SECRET_KEY);
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({ err: 'Email or Password is missing!' });
        }

        const user = await User.findAll({ where: { email } });

        if (user.length > 0) {
            bcrypt.compare(password, user[0].password, (err, result) => {
                if (err) {
                    throw new Error('Something went wrong!');
                } else if (result === true) {
                    res.status(200).json({ message: 'Successfully Logged in!', token: generateAccessToken(user[0].id) });
                } else {
                    return res.status(401).json({ err: 'Password is incorrect!' });
                }
            });
        } else {
            return res.status(404).json({ err: 'User not found!' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
};