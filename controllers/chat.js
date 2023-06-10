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

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS SDK with your access credentials
AWS.config.update({
    accessKeyId: 'AKIAT6JB7DRPFHUTSSWP',
    secretAccessKey: 'Ztlqm2ss9iVblvkYJ37/dNUrXoQmbtZSDaVUpDAP',
    region: 'us-east-1'
});

// Create an instance of the S3 service
const s3 = new AWS.S3();

// Configure multer middleware with the desired options
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'groupchatapp123',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString());
        }
    })
});

exports.sendMultimedia = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        try {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).json({ success: false, error: err.message });
            }

            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: 'No file selected.', success: false });
            }

            // File was uploaded successfully
            const fileUrl = req.file.location;
            console.log('File uploaded:', fileUrl);
            res.status(200).json({ success: true, message: 'File uploaded successfully.', fileUrl });
        } catch (err) {
            console.error('Error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    });
};
