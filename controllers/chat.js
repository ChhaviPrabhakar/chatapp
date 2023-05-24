const Chat = require('../models/chat');
const User = require('../models/user');

exports.postChat = async (req, res, next) => {
    try {
        const message = req.body.message;
        const groupId = req.body.groupId;

        if (groupId) {
            const newMsgInGrp = await req.user.createChat({ message, groupId });
            return res.status(201).json({ success: true, newMsgInGrp });
        }

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

        const allChat = await Chat.findAll({
            where: {
                id: { [Op.gt]: lastMsgId },
                groupId: null
            },
            include: [{ model: User, attributes: ['name'] }]
        });


        res.status(200).json({ allChat, success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, err: err });
    }
};