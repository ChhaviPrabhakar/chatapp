const Chat = require('../models/chat');
const User = require('../models/user');

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

const { Op } = require('sequelize');

exports.getChat = async (req, res, next) => {
    try {
        const lastMsgId = req.query.lastMsgId;
        console.log(lastMsgId);

        const allChat = await Chat.findAll({ where: { id: {[Op.gt]:lastMsgId} }, include : [ {model : User, attributes: ['name']} ] });

        res.status(200).json({ allChat, success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, err: err });
    }
};