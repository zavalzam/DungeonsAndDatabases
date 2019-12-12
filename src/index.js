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

app.get('/class', connectDb, function(req, res, next) {
	req.db.query('SELECT * FROM Class', function(err, Class){
		res.render('class', {Class});
		if (err) throw error;
	});
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

app.get('/char_create/:pcname/:pcid/:race/:level/:classname/:maxhp/:curhp/:ac/:speed/:profbonus/:str/:dex/:con/:int/:wis/:cha/:pname/:notes', connectDb, function(req, res, next) {
  let pcname = req.params.pcname;
  let pcid = req.params.pcid;
  let race = req.params.race;
  let level = req.params.level;
  let classname = req.params.classname;
  let maxhp = req.params.maxhp;
  let curhp = req.params.curhp;
  let ac = req.params.ac;
  let speed = req.params.speed;
  let profbonus = req.params.profbonus;
  let str = req.params.str;
  let dex = req.params.dex;
  let con = req.params.con;
  let intell = req.params.int;
  let wis = req.params.wis;
  let cha = req.params.cha;
  let pname = req.params.pname;
  let notes = req.params.notes;

  var Myqry = "INSERT INTO `PC` (`PC_name`, `PC_ID`, `Race_name`, `PC_level`, `Class_name`, `Max_HP`, `Current_HP`, `Armor_Class`, `Speed`, `Profficiency_bonus`, `Strength`, `Dexterity`, `Constitution`, `Intelligence`, `Wisdom`, `Charisma`, `Player_name`, `Notes`) VALUES (";
  Myqry += "'" + pcname + "', " + "'" + pcid + "', " + "'" + race + "', " + "'" + level + "', " + "'" + classname + "', " + "'" + maxhp + "', " + "'" + curhp + "', " + "'" + ac + "', " + "'" + speed + "', " + "'" + profbonus + "', " + "'" + str + "', " + "'" + dex + "', " + "'" + con + "', " + "'" + intell + "', " + "'" + wis + "', " + "'" + cha + "', " + "'" + pname + "', " + "'" + notes + "');";
  console.log(Myqry);

  req.db.query(Myqry, function(err, results) {
    console.log(results);
    if (err) throw error;
  })

  res.render('pcmade');
  close(req);
});

app.get('/char_view/:id/update/:attribute/:newval', connectDb, function(req, res, next) {
  let id = req.params.id;
  let attribute = req.params.attribute;
  let newval = req.params.newval;

  var Myqry = "UPDATE `PC` SET `" + attribute + "` = '" + newval + "' WHERE `PC`.`PC_ID` = '" + id + "';"
  var Newlink = "/char_view/" + id;

  req.db.query(Myqry, function(err, PCs) {
    if (err) return next(err);
    res.redirect(Newlink);
    close(req);
  });
});


app.get('/char_view/:id/spellbook/learn/:spellname', connectDb, function(req, res, next) {
  let id = req.params.id;
  let spellname = req.params.spellname;

  var Myqry = "INSERT INTO `Learns` (`PC_ID`, `Spell_name`) VALUES ('" + id + "', '" + spellname + "');"
  var Newlink = "/char_view/" + id;//  + "/" + "/spellbook";

  req.db.query(Myqry, function(err, results) {
    if (err) return next(err);
    console.log(results)
    res.redirect(Newlink);
    close(req);
  });
});

app.get('/char_view/:id/spellbook/learn', connectDb, function(req, res, next) {
  let id = req.params.id;

  var Myqry = "SELECT DISTINCT S.Spell_name FROM Spells S, Learns L WHERE S.Spell_name NOT IN (SELECT L.Spell_name FROM Learns L WHERE L.PC_ID = '" + id + "')";

  req.db.query(Myqry, function(err, unknownspells) {
    if (err) return next(err);
    console.log(unknownspells)
    res.render('learn', {unknownspells});
    close(req);
  });
});

app.get('/char_view/:id/spellbook', connectDb, function(req, res, next) {
  let id = req.params.id;

  var Myqry = "SELECT S.Spell_name, S.Spell_level, S.Casting_time, S.Description FROM Learns L, Spells S WHERE (L.PC_ID = '" + id + "') AND (L.Spell_name = S.Spell_name)";

  req.db.query(Myqry, function(err, learnedspells) {
    if (err) return next(err);
    console.log(learnedspells)
    res.render('spellbook', {learnedspells});
    close(req);
  });
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

app.get('/spells/:id', connectDb, function(req, res, next) {

  let id = req.params.id;
  // let name = req.params.name;
  // let classs = req.params.classs;
  // let eq = req.params.eq;
  // let level = req.params.level;
  // let cast = req.params.cast;

  var querystr;
  var varstr;
  var first = 0;

  querystr = 'SELECT * FROM Spells S WHERE S.Spell_name IN(SELECT C.Spell_name FROM Spell_classes C WHERE C.Spell_class = ?) ;';

  req.db.query(querystr, [id], function(err, Spells, Spell_classes) {
    if (err) return next(err);
    else {
      console.log(Spells);
      res.render('render_SP', {Spells});
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
