const Group = require('../models/group');
const Chat = require('../models/chat');
const GroupMembership = require('../models/groupMembership');
const User = require('../models/user');

exports.createGroups = async (req, res, next) => {
    try {
        const groupName = req.body.groupName;
        const createdBy = req.user.id;
        const newGroup = await req.user.createGroup({ groupName, createdBy }, { through: { isAdmin: true } });
        res.status(201).json({ success: true, newGroup });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, err: err });
    }
};

exports.getGroupList = async (req, res, next) => {
    try {
        const groupList = await req.user.getGroups();
        res.status(200).json({ success: true, groupList });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, err: err });
    }
};

exports.deleteGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        const user = await GroupMembership.findOne({ where: { userId: req.user.id, groupId } });
        if (!user.isAdmin) {
            return res.status(401).json({ message: 'Only admins can delete the group!', success: false });
        }

        const creator = await Group.findOne({ where: { id: groupId, createdBy: req.user.id } });
        if (!creator) {
            return res.status(401).json({ message: 'Only creator can delete the group, you may "Exit this group"!', success: false });
        }

        const removedGroup = await Group.destroy({ where: { id: groupId } });
        res.status(200).json({ removedGroup, message: 'Successfully deleted this group.', success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, err: err });
    }
};

exports.getGroupChat = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const grpChat = await Chat.findAll({ where: { groupId: groupId }, include: [{ model: User, attributes: ['name'] }] });
        res.status(200).json({ success: true, grpChat });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, err: err });
    }
};

exports.addMember = async (req, res, next) => {
    try {
        const { mobNum, groupId } = req.body;

        if (!mobNum) {
            return res.status(400).json({ message: 'Bad Request!', success: false });
        }

        const user = await GroupMembership.findOne({ where: { userId: req.user.id, groupId: groupId } });
        if (!user.isAdmin) {
            return res.status(401).json({ message: 'Only admin can add members!', success: false });
        }

        const member = await User.findOne({ where: { mobile: mobNum } });
        if (!member) {
            return res.status(404).json({ message: 'User not found!', success: false });
        }

        const alreadyMember = await GroupMembership.findOne({ where: { userId: member.id, groupId: groupId } });
        if (alreadyMember) {
            return res.status(403).json({ message: 'User is already in this group!', success: false });
        }

        const newMember = await GroupMembership.create({
            userId: member.id,
            groupId: groupId,
            isAdmin: false
        });
        const newMemberWithName = { userId: member.id, name: member.name };
        res.status(200).json({ message: 'Member added to this group successfully.', newMember, newMemberWithName, success: true });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Something went wrong!', success: false });
    }
}

exports.getMembers = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const members = await GroupMembership.findAll({
            where: { groupId },
            attributes: ['userId', 'isAdmin']
        });

        // Extract userId values from the members array
        const userIds = members.map(member => member.userId);

        // Fetch the names of users from the User table based on userIds
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'name']
        });

        // Map the names to the respective user objects in the members array
        const membersWithNames = members.map(member => {
            const user = users.find(user => user.id === member.userId);
            return {
                userId: member.userId,
                isAdmin: member.isAdmin,
                name: user ? user.name : 'Unknown'
            };
        });
        res.status(200).json({ membersWithNames, success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err, success: false });
    }
}

exports.removeMember = async (req, res, next) => {
    try {
        const { userId, groupId } = req.query;

        const creator = await Group.findOne({ where: { id: groupId, createdBy: userId } });

        if (creator) {
            if (creator.createdBy == req.user.id) {
                await Group.update({ createdBy: null }, { where: { id: groupId } });
                const creatorRemoved = await GroupMembership.destroy({ where: { userId: req.user.id, groupId: groupId } });
                return res.status(200).json({ creatorRemoved, message: 'Successfully removed yourself from this group', success: true });
            } else {
                return res.status(401).json({ message: `Can't remove the Creator of this group!`, success: false });
            }
        }

        const removedMember = await GroupMembership.destroy({ where: { userId: userId, groupId: groupId } });
        res.status(200).json({ removedMember, message: 'Successfully removed this Member.', success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err, success: false });
    }
};

exports.makeAdmin = async (req, res, next) => {
    try {
        const { userId, groupId } = req.query;

        const newAdmin = await GroupMembership.update({ isAdmin: true }, { where: { userId: userId, groupId: groupId } });

        res.status(200).json({ newAdmin, message: 'Now this member is also admin.', success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err, success: false });
    }
}

exports.removeAdmin = async (req, res, next) => {
    try {
        const { userId, groupId } = req.query;

        const creator = await Group.findOne({ where: { id: groupId, createdBy: userId } });
        if (creator) {
            return res.status(401).json({ message: `You can't dismiss Creator as admin, because they created this group.`, success: false });
        }

        const removedAdmin = await GroupMembership.update({ isAdmin: false }, { where: { userId: userId, groupId: groupId } });

        res.status(200).json({ removedAdmin, message: 'Now this member is no more admin.', success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err, success: false });
    }
}

// const AWS = require('aws-sdk');

// const uploadToS3 = (data, filename) => {
//     const BUCKET_NAME = 'groupchatapp123';
//     const IAM_USER_KEY = 'AKIAT6JB7DRPFHUTSSWP';
//     const IAM_USER_SECRET = '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';

//     let s3bucket = new AWS.S3({
//         accessKeyId: IAM_USER_KEY,
//         secretAccessKey: IAM_USER_SECRET
//     });

//     var params = {
//         Bucket: BUCKET_NAME,
//         Key: filename,
//         Body: data,
//         ACL: 'public-read'
//     };

//     return new Promise((resolve, reject) => {
//         s3bucket.upload(params, (err, s3response) => {
//             if (err) {
//                 console.log('something went wrong', err);
//                 reject(err);
//             } else {
//                 console.log('success', s3response);
//                 resolve(s3response.Location);
//             }
//         });
//     });
// }

// exports.sendFile = async (req, res, next) => {
//     try {
//         console.log(req.body);
//         console.log(req.params);
//         console.log(req.file);
//         const { groupId } = req.params;
//         if (!req.file) {
//             return res.status(400).json({ success: false, message: `Please choose file !` });
//         }

//         let type = (req.file.mimetype.split('/'))[1];
//         console.log('type', type)
//         const file = req.file.buffer;
//         const filename = `GroupChat/${new Date()}.${type}`;
//         console.log(`file ===>`, file);
//         console.log('filename ====>', filename);
//         const fileUrl = await updloadToS3(file, filename);
//         console.log('fileUrl =============>', fileUrl);

//         let result = await req.user.createChat({
//             message: fileUrl,
//             groupId: groupId
//         })
//         const data = { message: result.message, createdAt: result.createdAt };

//         res.status(200).json({ success: true, data });
//     } catch (err) {
//         console.log(err);
//         res.status(400).json({ success: false, message: `Something went wrong !` });
//     }
// }