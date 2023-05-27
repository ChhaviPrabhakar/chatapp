const User = require('../models/user');
const ForgotPswd = require('../models/forgotPswd');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Sib = require('sib-api-v3-sdk');
const uuid = require('uuid');

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

const generateAccessToken = (id, name) => {
    return jwt.sign({ userId: id, name }, process.env.TOKEN_SECRET_KEY);
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
                    res.status(200).json({ message: 'Successfully Logged in!', token: generateAccessToken(user[0].id, user[0].name) });
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

exports.forgotPswd = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (user) {
            const id = uuid.v4();
            await ForgotPswd.create({ id, isActive: true, userId: user.id });

            const client = Sib.ApiClient.instance

            const apiKey = client.authentications['api-key']
            apiKey.apiKey = process.env.SIB_API_KEY

            const sender = {
                email: 'satyamkumar2020@gmail.com'
                // name: 'Steve Rodgers',
            }

            const recievers = [
                {
                    email: email
                }
            ]

            const transactionalEmailApi = new Sib.TransactionalEmailsApi()

            await transactionalEmailApi
                .sendTransacEmail({
                    subject: 'Reset your password',
                    sender,
                    to: recievers,
                    // textContent: `Reset your password from this link :- http://3.92.199.165:3000/user/resetpasssword/${id}`
                    htmlContent: `<h1>Reset your password from this link</h1>
                	<a href="http://3.92.199.165:3000/user/resetpassword/${id}">Reset password</a>`
                    // params: {
                    //     role: 'frontend',
                    // },
                })
            // .then(console.log)
            // .catch(console.log)

            res.status(200).json({ message: 'Reset link sent to your email', success: true });
        } else {
            throw new Error('User does not exist');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err, success: false });
    }
}

exports.resetPswd = async (req, res, next) => {
    try {
        const reqId = req.params.id;
        const request = await ForgotPswd.findOne({ where: { id: reqId, isActive: true } });
        if (request.id == reqId) {
            await request.update({ isActive: false });
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>
                                    <form action="/user/updatepassword/${reqId}" method="get">
                                        <label for="newpassword">Enter New Password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>Reset password</button>
                                    </form>
                                </html>`
            );
        } else {
            throw new Error('Link expired!, resend the link');
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err });
    }
}

exports.updatepassword = async (req, res, next) => {
    try {
        const { newpassword } = req.query;
        const { updateId } = req.params;
        const request = await ForgotPswd.findOne({ where: { id: updateId } });
        if (!request) {
            throw new Error('Invalid request ID');
        }
        const user = await User.findOne({ where: { id: request.userId } });

        if (!newpassword) {
            return res.status(400).json({ error: 'Password is required', success: false });
        }

        if (user) {
            const saltRounds = 10;
            bcrypt.hash(newpassword, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                    throw new Error(err);
                }
                await user.update({ password: hash });
                res.status(201).json({ message: 'New password updated successfully!' });
            });
        } else {
            res.status(404).json({ error: 'No user exist', success: false });
            res.redirect('file:///C:/VS%20code%20Sharpener/chatApp/views/login.html');
        }
    } catch (err) {
        console.log(err);
        return res.status(403).json({ err, success: false })
    }
}