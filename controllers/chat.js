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

exports.getChat = async (req, res, next) => {
    try {

        const allChat = await Chat.findAll({ where: { userId: req.user.id }});

            res.status(200).json({ allChat, success: true });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, err: err });
        }
    };