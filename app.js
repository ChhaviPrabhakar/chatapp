const express = require('express');
const cors = require('cors');

const sequelize = require('./util/database');

const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const GroupMembership = require('./models/groupMembership');

const app = express();

app.use(cors()); //{ origin: "http://localhost:3000" }
app.use(express.json());

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/groups', groupRoutes);

User.hasMany(Chat);
Chat.belongsTo(User);

Group.hasMany(Chat);
Chat.belongsTo(Group);

User.belongsToMany(Group, { through: GroupMembership });
Group.belongsToMany(User, { through: GroupMembership });

sequelize.sync()  //{force: true}
    .then(result => {
        app.listen(3000);
        console.log('Server running on PORT - 3000');
    })
    .catch(err => console.log(err));