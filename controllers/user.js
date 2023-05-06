const User = require('../models/user');
const bcrypt = require('bcrypt');

function isStringInvalid(string) {
    if (string == undefined || string.length === 0) {
        return true;
    } else {
        return false;
    }
}

exports.signup = (req, res, next) => {
    try {
        const { name, email, mobile, password, confirmPassword } = req.body;

        if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(mobile) || isStringInvalid(password)) {
            return res.status(400).json({ err: "Something is missing!" });
        }

        if(password !== confirmPassword) {
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