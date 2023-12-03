var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');

var database = require('../database');

router.get('/', function (req, res, next) {
  console.log('SESSION::', req.session);
  // res.render('index', { title: 'Express', session: req.session });
  if (req.session.userId != null) {
    console.log("login")
    res.render('pages/memory/view');
  }
  res.redirect('/login');
});

router.post('/login', function (request, response, next) {
  var user_email_address = request.body.user_email_address;

  var user_password = request.body.user_password;

  if (user_email_address && user_password) {
    query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_email_address}"
        `;

    database.query(query, async function (error, data) {
      if (data.length > 0) {
        for (var count = 0; count < data.length; count++) {
          const passwordMatch = await bcrypt.compare(
            user_password,
            data[count].user_password,
          );

          if (passwordMatch) {
            request.session.user_id = data[count].user_id;
            request.session.save(err =>{
              if(err){
                response.send('Incorrect Password');
              }
            } )

            response.redirect('/memory');
          } else {
            response.send('Incorrect Password');
          }
        }
      } else {
        response.send('Incorrect Email Address');
      }
      response.end();
    });
  } else {
    response.send('Please Enter Email Address and Password Details');
    response.end();
  }
});

router.post('/register', async function (request, response, next) {
  var user_email_address = request.body.user_email_address;
  var user_password = request.body.user_password;
  var query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_email_address}"`;
  database.query(query, function (error, data) {
    if (data.length > 0) {
      return res.status(400).json({ message: 'User existed' });
    }
  });

  const hashedPassword = await bcrypt.hash(user_password, 10);
  query = `INSERT INTO user_login (user_email, user_password, user_session_id) VALUES ("${user_email_address}", "${hashedPassword}", '')`;

  database.query(query, function (error, data) {
    console.log(error);
    if (!error) {
      response.redirect('/');
    } else {
      response.status(500).json({ message: 'Server error' });
    }
  });
});

router.get('/logout', function (request, response, next) {
  request.session.destroy();
  response.redirect('/login');
});

router.get('/login', function (request, response, next) {
  if (request.session?.userId) {
    response.redirect('memory');
  } else {
    response.render('login');
  }
});

router.get('/register', function (request, response, next) {
  response.render('register');
});

router.get('/memory', function (request, response, next) {
  var user_id = request.session.user_id
  query = `select * from user_post where type = 1 and user_id = "${user_id}"`;
  database.query(query, function (error, data) {
    console.log(error);
    if (!error) {
      response.render('pages/memory/view', { activeLink: '/memory', data: data });
    } else {
      response.status(500).json({ message: 'Server error' });
    }
  });
});

router.get('/diary', function (request, response, next) {
  var user_id = request.session.user_id
  query = `select * from user_post where type = 2 and user_id = "${user_id}"`;
  database.query(query, function (error, data) {
    console.log(error);
    if (!error) {
      response.render('pages/diary/view', { activeLink: '/diary', data: data });
    } else {
      response.status(500).json({ message: 'Server error' });
    }
  });
});


router.get('/memory/add', function (request, response, next) {
  response.render('pages/memory/add', { activeLink: '/memory' });
});

router.get('/diary/add', function (request, response, next) {
  response.render('pages/diary/add', { activeLink: '/diary' });
});



function formatDateToCustomString(date) {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

router.get('/memory/edit/:id', function (request, response, next) {
  query = `
  SELECT * FROM user_post 
  WHERE id = "${request.params.id}"
  `;
  database.query(query, function (error, data) {
    console.log(error);
    if (!error) {
      console.log(data)
      date = formatDateToCustomString(new Date(data[0].date))
      res = {
        date_time: date,
        contentData: JSON.parse(data[0].content),
        id: data[0].id,
        score: data[0].score,
        title: data[0].title
        
      }
      console.log(res)
      response.render('pages/memory/edit', { activeLink: '/memory', data: res });
    } else {
      response.status(500).json({ message: 'Server error' });
    }
  });
})


  router.get('/diary/edit/:id', function (request, response, next) {
    query = `
    SELECT * FROM user_post 
    WHERE id = "${request.params.id}"
    `;
    database.query(query, function (error, data) {
      console.log(error);
      if (!error) {
        console.log(data)
        date = formatDateToCustomString(new Date(data[0].date))
        res = {
          date_time: date,
          contentData: JSON.parse(data[0].content),
          id: data[0].id,
          title: data[0].title
          
        }
        console.log(res)
        response.render('pages/diary/edit', { activeLink: '/diary', data: res });
      } else {
        response.status(500).json({ message: 'Server error' });
      }
    });


  // response.render('pages/memory/edit', {
  //   activeLink: '/memory',
  //   data: {}, // - Memory data
  // });
});

// router.post('/test', function (request, response, next) {
//   console.log('REQUEST BODY::', request.body);
//   response.send(request.body);
// });


router.post('/add_memory', function (request, response, next) {
  console.log('REQUEST BODY::', request.body);
  var user_id = request.session.user_id
  var{title, date_time, editor_content, score} = request.body
  var query = `
  insert into user_post(title ,date, content, type, score, user_id) values ("${title}","${date_time}", '${editor_content}', 1, "${score}", ${user_id})
  `;
  database.query(query, function (error, data) {
    console.log(error);
    if (!error) {
      response.redirect('/memory');
    } else {
      response.status(500).json({ message: 'Server error' });
    }
  });
});


router.post('/update_memory/:id', function (request, response, next) {
  console.log('REQUEST BODY::', request.body);
  var {title, date_time, editor_content, score} = request.body
  const id = request.params.id;
  console.log(id)
  var query = `
  update user_post set
  title = "${title}",
  date  = "${date_time}", 
  content = '${editor_content}', 
  score = "${score}"
  where id = "${id}"
  `;
  database.query(query, function (error, data) {
    console.log(error);
    if (!error) {
      response.redirect('/memory');
    } else {
      response.status(500).json({ message: 'Server error' });
    }
  });
});



router.post('/add_diary', function (request, response, next) {
  console.log('REQUEST BODY::', request.body);
  var user_id = request.session.user_id
  var{title, date_time, editor_content, score} = request.body
  var query = `
  insert into user_post(title ,date, content, type, score, user_id) values ("${title}","${date_time}", '${editor_content}', 2, 0, ${user_id})
  `;
  database.query(query, function (error, data) {
    console.log(error);
    if (!error) {
      response.redirect('/diary');
    } else {
      response.status(500).json({ message: 'Server error' });
    }
  });
});



router.post('/update_diary/:id', function (request, response, next) {
  console.log('REQUEST BODY::', request.body);
  var {title, date_time, editor_content, score} = request.body
  const id = request.params.id;
  console.log(id)
  var query = `
  update user_post set
  title = "${title}",
  date  = "${date_time}", 
  content = '${editor_content}'
  where id = "${id}"
  `;
  database.query(query, function (error, data) {
    console.log(error);
    if (!error) {
      response.redirect('/diary');
    } else {
      response.status(500).json({ message: 'Server error' });
    }
  });
});



// router.post('/memory', async function (request, response, next) {
//   var user_email_address = request.body.user_email_address;
//   var user_password = request.body.user_password;
//   var query = `
//         SELECT * FROM user_login 
//         WHERE user_email = "${user_email_address}"`;
//   database.query(query, function (error, data) {
//     if (data.length > 0) {
//       return res.status(400).json({ message: 'User existed' });
//     }
//   });

//   const hashedPassword = await bcrypt.hash(user_password, 10);
//   query = `INSERT INTO user_login (user_email, user_password, user_session_id) VALUES ("${user_email_address}", "${hashedPassword}", '')`;

//   database.query(query, function (error, data) {
//     console.log(error);
//     if (!error) {
//       response.redirect('/');
//     } else {
//       response.status(500).json({ message: 'Server error' });
//     }
//   });
// });

module.exports = router;
