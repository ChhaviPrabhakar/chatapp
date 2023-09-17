const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const fileUpload = require('express-fileupload');

const sequelize = require('./util/database');
const path = require('path');

const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const GroupMembership = require('./models/groupMembership');
const ForgotPswd = require('./models/forgotPswd');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// io.on('connection', socket => {
//     console.log('connected with sockedId= ', socket.id);
// });

app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use(fileUpload());

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/groups', groupRoutes);

app.use((req, res) => {
    res.sendFile(path.join(__dirname, `views/${req.url}`));
});

User.hasMany(Chat);
Chat.belongsTo(User);

Group.hasMany(Chat);
Chat.belongsTo(Group);

User.hasMany(ForgotPswd);
ForgotPswd.belongsTo(User);

User.belongsToMany(Group, { through: GroupMembership });
Group.belongsToMany(User, { through: GroupMembership });

sequelize.sync()  //{force: true}
    .then(result => {
        server.listen(3000);
        console.log('<<<< Server running on PORT - 3000 >>>>');
    })
    .catch(err => console.log(err));