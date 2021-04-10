const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "database",
});
connection.connect((err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Database connected successfully...");
    }
});

module.exports = connection;