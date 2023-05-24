const express = require('express');
const router = express.Router();

const userAuth = require('../middleware/auth');
const groupController = require('../controllers/group');

router.post('/create-group', userAuth.authenticate, groupController.createGroups);
router.get('/group-list', userAuth.authenticate, groupController.getGroupList);
router.delete('/delete-group/:groupId', userAuth.authenticate, groupController.deleteGroup);
router.get('/group-chat/:groupId', userAuth.authenticate, groupController.getGroupChat);
router.post('/add-member', userAuth.authenticate, groupController.addMember);
router.get('/get-member/:groupId', userAuth.authenticate, groupController.getMembers);
router.delete('/remove-member', userAuth.authenticate, groupController.removeMember);
router.post('/make-admin', userAuth.authenticate, groupController.makeAdmin);

module.exports = router;