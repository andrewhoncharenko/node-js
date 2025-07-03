const Sequelize = require("sequelize");

const sequelize = new Sequelize("node-complete", "devuser", "A564312)", { dialect: "mysql", host: "localhost" });

module.exports = sequelize;