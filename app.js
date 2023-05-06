const express = require('express');
const cors = require('cors');

const sequelize = require('./util/database');

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}));
app.use(express.json());

const userRoutes = require('./routes/user');

app.use('/user', userRoutes);

sequelize.sync()  //{force: true}
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));