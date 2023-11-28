const mysql = require('mysql');
var bcrypt = require("bcryptjs");

const connection = mysql.createConnection({
	host : 'localhost',
	database : 'ha',
	user : 'admin',
	password : 'admin'
});

connection.connect(function(error){
	if(error)
	{
		throw error;
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;