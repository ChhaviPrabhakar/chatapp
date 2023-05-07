const express = require('express');
const cors = require('cors');

const sequelize = require('./util/database');

const User = require('./models/user');
const Chat = require('./models/chat');

const app = express();

app.use(cors()); //{ origin: "http://localhost:3000" }
app.use(express.json());

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);

User.hasMany(Chat);
Chat.belongsTo(User);

sequelize.sync()  //{force: true}
    .then(result => {
        app.listen(3000);
        console.log('Server running on PORT - 3000');
    })
    .catch(err => console.log(err));