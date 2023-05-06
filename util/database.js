const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('chatapp', 'root', 722446, {
    dialect: 'mysql',
    host: localhost
});

module.exports = sequelize;