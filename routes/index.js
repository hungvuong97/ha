var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");

var database = require('../database');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', session : req.session });
});

router.post('/login', function(request, response, next){

    var user_email_address = request.body.user_email_address;

    var user_password = request.body.user_password;

    if(user_email_address && user_password)
    {
        query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_email_address}"
        `;

        database.query(query, async function(error, data){

            if(data.length > 0)
            {
                for(var count = 0; count < data.length; count++)
                {
                    const passwordMatch = await bcrypt.compare(user_password,data[count].user_password);

                    if(passwordMatch)
                    {
                        request.session.user_id = data[count].user_id;

                        response.redirect("/");
                    }
                    else
                    {
                        response.send('Incorrect Password');
                    }
                }
            }
            else
            {
                response.send('Incorrect Email Address');
            }
            response.end();
        });
    }
    else
    {
        response.send('Please Enter Email Address and Password Details');
        response.end();
    }

});


router.post('/register',async function(request, response, next){
    var user_email_address = request.body.user_email_address;
    var user_password = request.body.user_password;
    var query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_email_address}"`;
    database.query(query, function(error, data){
        if(data.length > 0){
            return res.status(400).json({ message: 'User existed' });
        }
    })

    const hashedPassword = await bcrypt.hash(user_password, 10);
    query = `INSERT INTO user_login (user_email, user_password, user_session_id) VALUES ("${user_email_address}", "${hashedPassword}", '')`;

    database.query(query, function(error, data){
        console.log(error)
        if(!error){
            response.redirect("/");
        }else{
            response.status(500).json({ message: 'Server error' });
        }
    })
})

router.get('/logout', function(request, response, next){

    request.session.destroy();
    response.redirect("/");

});

router.get('/register', function(request, response, next){

    request.session.destroy();
    response.render("register");

});

router.get('/memory', function(request, response, next){
    response.render("memory");
});



router.post('/memory',async function(request, response, next){
    var user_email_address = request.body.user_email_address;
    var user_password = request.body.user_password;
    var query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_email_address}"`;
    database.query(query, function(error, data){
        if(data.length > 0){
            return res.status(400).json({ message: 'User existed' });
        }
    })

    const hashedPassword = await bcrypt.hash(user_password, 10);
    query = `INSERT INTO user_login (user_email, user_password, user_session_id) VALUES ("${user_email_address}", "${hashedPassword}", '')`;

    database.query(query, function(error, data){
        console.log(error)
        if(!error){
            response.redirect("/");
        }else{
            response.status(500).json({ message: 'Server error' });
        }
    })
})


module.exports = router;

