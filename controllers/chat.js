const Chat = require('../models/chat');
const User = require('../models/user');
const s3service = require('../services/s3services');

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

exports.sendMultimedia = async (req, res, next) => {
    try {
        const file = req.files.file;
        if (!file) {
            return res.status(400).json({ message: 'No file selected.', success: false });
        }

        const userId = req.user.id;
        const filename = `User${userId}/${file.name}`;
        const fileData = file.data;
        const fileUrl = await s3service.uploadToS3(fileData, filename);
        res.status(200).json({ success: true, message: 'File uploaded successfully.', fileUrl });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
