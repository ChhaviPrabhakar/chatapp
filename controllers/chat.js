const Chat = require('../models/chat');

exports.message = async (req, res, next) => {
    try {
    const message = req.body.message;

    const newMessage = await req.user.createChat({ message });
    res.status(201).json({ success: true, newMessage });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, err: err });
    }
};