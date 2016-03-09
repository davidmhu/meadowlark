var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');//for form handle
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fortunes = require("./lib/fortune.js");
var fs = require('fs');

app.set('views', path.join(__dirname,'app_server', 'views'));

var appServerLayout=path.join(__dirname,'app_server', 'views','layouts','main');
//app.locals.layout=appServerLayout;another way to change default layout;
var handlebars = require('express-handlebars').create({defaultLayout:appServerLayout}) ;//.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//console.log(handlebars.engine);
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname+'/public'));

app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' &&
                    req.query.test === '1';
            next();
});

app.use(cookieParser());
app.use(require('express-session')({
      secret: 'This is a secret',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week 
      },
      
      resave:true,
      saveUninitialized:true
    }));
app.use(function(req, res, next){
    // if there's a flash message, transfer
    // it to the context, then clear it
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

app.get('/', function(req, res){ 
	/*res.type('text/plain');
    res.send('Meadowlark Travel');*/
    res.render('home');
});

app.get('/about', function(req, res){
    /*res.type('text/plain');
    res.send('About Meadowlark Travel');*/  
    res.render('about',{
        fortune:fortunes.getFortune(),
        pageTestScript:'/qa/tests-about.js'
    });
});

app.get('/tours/hood-river', function(req, res){
    res.render('tours/hood-river'); 
});
app.get('/tours/request-group-rate', function(req, res){
    res.render('tours/request-group-rate');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/newsletter', function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.post('/process', function(req, res){
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    res.redirect(303, '/');
});

app.get('/contest/vacation-photo',function(req,res){
        var now = new Date();
        res.render('contest/vacation-photo',{
            year: now.getFullYear(),month: now.getMonth()
        });
});
/*app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
    if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});*/
// make sure data directory exists
var dataDir = __dirname + '/data';
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName, email, year, month, photoPath){
// TODO...this will come later
}
app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.uploadDir = "./tmp";
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        if(err) {
            res.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'There was an error processing your submission. ' +
                'Pelase try again.',
            };
            return res.redirect(303, '/contest/vacation-photo');
        }
        var photo = files.photo;
        var dir = vacationPhotoDir + '/' + Date.now();
        var path = dir + '/' + photo.name;
        fs.mkdirSync(dir);
        fs.renameSync(photo.path, dir + '/' + photo.name);
        saveContestEntry('vacation-photo', fields.email,
            req.params.year, req.params.month, path);
        req.session.flash = {
            type: 'success',
            intro: 'Good luck!',
            message: 'You have been entered into the contest.',
        };
        return res.redirect(303, '/');
    });
});

// custom 404 page
app.use(function(req, res){ 
			/*res.type('text/plain');
            res.status(404);
            res.send('404 - Not Found');*/
            res.render('404');
});
    // custom 500 page
app.use(function(err, req, res, next){ 
	/*console.error(err.stack);
            res.type('text/plain');
            res.status(500);
            res.send('500 - Server Error');*/
    res.render('500');
});


/*app.listen(app.get('port'), function(){
console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
    });*/

function startServer() {
    require('http').createServer(app).listen(app.get('port'), function(){
        console.log( 'Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.' );
    });
}
if(require.main === module){
    // application run directly; start app server
    startServer();
    } else {
    // application imported as a module via "require": export function
    // to create server
    module.exports = startServer;
}