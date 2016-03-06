var express = require('express');
var app = express();
var path = require('path');
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
    
    res.render('about',{fortune:fortunes.getFortune()});
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
