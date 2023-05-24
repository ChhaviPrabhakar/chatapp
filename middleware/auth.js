const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token not found' });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
