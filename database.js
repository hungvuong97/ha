const mysql = require('mysql');
var bcrypt = require('bcryptjs');

const connection = mysql.createConnection({
  host: 'localhost',
  database: 'ha',
  user: 'root',
  password: 'tienanh1512',
});

connection.connect(function (error) {
  if (error) {
    console.log('Connect to DB failed with err: ', error);
    throw error;
  } else {
    console.log('MySQL Database is connected Successfully');
  }
});

module.exports = connection;
