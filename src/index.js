/**
 * Node.js Web Application Template
 *
 * The code below serves as a starting point for anyone wanting to build a
 * website using Node.js, Express, Handlebars, and MySQL. You can also use
 * Forever to run your service as a background process.
 */
const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const path = require('path');

const app = express();

// Configure handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs'
});

// Configure the views
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(path.basename(__dirname), 'views'));

// Setup static content serving
app.use(express.static(path.join(path.basename(__dirname), 'public')));

/**
 * Create a database connection. This is our middleware function that will
 * initialize a new connection to our MySQL database on every request.
 */
const config = require('./config');
function connectDb(req, res, next) {
  console.log('Connecting to the database');
  let connection = mysql.createConnection(config);
  connection.connect();
  req.db = connection;
  console.log('Database connected');
  next();
}

/**
 * This is the handler for our main page. The middleware pipeline includes
 * our custom `connectDb()` function that creates our database connection and
 * exposes it as `req.db`.
 */

app.get('/', connectDb, function(req, res) {
  console.log('Got request for the home page');

  res.render('home');

  close(req);
});


app.get('/spells', connectDb, function(req, res, next) {

  req.db.query('SELECT * FROM Spells', function(err, Spells) {
    res.render('spells', {Spells});
    if (err) throw error;
  })
  close(req);
});

app.get('/monster', connectDb, function(req, res, next) {

   req.db.query('SELECT * FROM Monster', function(err, Monster) {
     res.render('monster', {Monster});
     if (err) throw error;
   })
   close(req);
});

app.get('/monster/:name', connectDb, function(req, res, next){
    let name = req.params.name;
    req.db.query('SELECT * FROM Monster WHERE Monster_name = ?', [name], function(err, Monster) {
      if (err) return next(err);
      if (Monster.length === 0) {
        res.render('404');
      } else {
        console.log(Monster);
        res.render('monDetails', {Monster});
      }
      close(req);
    });
});


app.get('/char_create', connectDb, function(req, res, next) {

  req.db.query('SELECT Race_name FROM Race', function(err, results) {
    console.log(results);
    res.render('char_create', {results});
    if (err) throw error;
  })
  close(req);

});

app.get('/char_view/:id', connectDb, function(req, res, next) {
  let id = req.params.id;
  req.db.query('SELECT * FROM PC WHERE PC_ID = ?', [id], function(err, PCs) {
    if (err) return next(err);
    if (PCs.length === 0) {
      res.render('404');
    } else {
      console.log(PCs);
      res.render('render_PC', {PCs});
    }
    close(req);
  });
});

app.get('/char_view', connectDb, function(req, res, next) {

  res.render('char_view');

  close(req);
});



/**
 * Handle all of the resources we need to clean up. In this case, we just need
 * to close the database connection.
 *
 * @param {Express.Request} req the request object passed to our middleware
 */
function close(req) {
  if (req.db) {
    req.db.end();
    req.db = undefined;
    console.log('Database connection closed');
  }
}

/**
 * Capture the port configuration for the server. We use the PORT environment
 * variable's value, but if it is not set, we will default to port 3000.
 */
const port = process.env.PORT || 3000;

/**
 * Start the server.
 */
app.listen(port, function() {
  console.log('== Server is listening on port', port);
});
