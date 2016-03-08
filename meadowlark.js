var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');//for form handle
var bodyParser = require('body-parser');
var fortunes = require("./lib/fortune.js");

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
app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
    if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
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


app.listen(app.get('port'), function(){
console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
    });
