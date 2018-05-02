var bodyParser = require('body-parser');
var express = require('express');
var mysql = require('mysql');
var app = express();
var session = require('express-session');

var database = require('./node/database');
var helper = require('./node/helper');

app.set("view engine", "ejs");
app.set('trust proxy', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'fdasfrhegasr'
}));

// GET / : the main page
app.get('/', function(req, res, next) {
    
    // Grab IP, if it is in the db then block it, if it isn't then add it
    var ip = (req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress).split(",")[0];
    // console.log(ip);

    // If they haven't done the intro survey, load that page instead for /
    if(!req.session.didSurvey){
        // console.log('didnt do the survey...');
        res.render('intro');
        return;                     // return otherwise this will continue on, could have just put the rest of the code unerneath this in an else and we wouldn't need return here
    }

    // If they have done the intro survey, load the main page
    database.startConnection();
    
    // If hit download button or submitted a rating skip world selection because it would reset the world selection and the db
    // will update the wrong world i.e. if the user is on world 1 and hits download, if we changed the worldNum here
    // then it might go to say world 2 and update 2 instead of 1.
    // This keeps it so that the user and db are all on the same world at all times for the user's session.
    if(req.query.currDownloads || req.query.noDownloads || req.query.rating){
        
    }else{
        req.session.worlds = helper.getRandomInt(1, 101);
        req.session.worldNum = 0;
        // 25 25 25 25 for each world
        if(req.session.worlds >= 1 && req.session.worlds <= 25){
            // Enter world 1
            req.session.worldNum = 1;
        }else if(req.session.worlds >= 26 && req.session.worlds <= 50){
            // Enter world 2
            req.session.worldNum = 2;
        }else if(req.session.worlds >= 51 && req.session.worlds <= 75){
            // Enter world 3
            req.session.worldNum = 3;
        }else{
            // Enter world 4
            req.session.worldNum = 4;
        }
    }

    // Hit download button 
    if(req.query.currDownloads){
        // REMOVE THIS IF BECAUSE IT DOES NOT MATTER IF CURRDOWNLOADS IS SHOWING OR NOT WE CAN JUST INCREMENT 1 FROM THE DB
        // Hit download button on influenced page with downloads displayed
        var newDownloads = Number(req.query.currDownloads) + 1;
        database.updateDownloads(req.query.docID, newDownloads, req.session.worldNum, req.session.control, req.session.lowHigh, function(result){
            // console.log(result);
        });
    }else if(req.query.noDownloads){
        // Hit download button on regular pages
        database.updateDownloadsByOne(req.query.docID, req.session.worldNum, req.session.control, req.session.lowHigh, function(result){
            // console.log(result);
            res.send('success');
        });
    }else if(req.query.rating){
        // Submitting rating
        database.insertRatings(req.query.docID, req.query.rating, req.session.worldNum, req.session.control, req.session.lowHigh, function(result){
            database.getFileName(req.query.docID, function(fileName){
                res.send(fileName[0]);
            });
        });
    }else{
        // Just entering the page
        var highLow = helper.getRandomInt(1, 101);  // 50 50 for whether it enters possibility of low influence or high influence
        // console.log('highLow was: ' + highLow);
        if(highLow >= 1 && highLow <= 50){
            req.session.control = 'L';
            // Enter low influence chance
            var influenceOrRegular = helper.getRandomInt(1, 101);               // 20 80 for low influence page vs regular page
            if(influenceOrRegular >= 1 && influenceOrRegular <= 20){
                // Enter regular page
                console.log('entering normal page (L r), world ' + req.session.worldNum);
                req.session.lowHigh = 'r';
                database.getDocsRandomOrder(req.session.worldNum, req.session.control, req.session.lowHigh, function(docs) {
                    res.render('index', {
                        docs: docs,
                        control: req.session.control,
                        lowHigh: req.session.lowHigh,
                        worldNum: req.session.worldNum,
                        cssFileName: 'style',
                        jsFileName: 'main',
                        showDownloads: 0
                    });
                });
            }else{
                // Enter controlled low influence page
                console.log('entering low influence page (L l), world ' + req.session.worldNum);
                req.session.lowHigh = 'l';                
                database.getDocsRandomOrder(req.session.worldNum, req.session.control, req.session.lowHigh, function(docs) {
                    res.render('index', {
                        docs: docs,
                        control: req.session.control,
                        lowHigh: req.session.lowHigh,
                        worldNum: req.session.worldNum,
                        cssFileName: 'style',
                        jsFileName: 'main',
                        showDownloads: 1
                    });
                });
            }
        }else{
            req.session.control = 'H';            
            // Enter high influence chance
            var influenceOrRegular = helper.getRandomInt(1, 101);               // 20 80 for high influence page vs regular page
            if(influenceOrRegular >= 1 && influenceOrRegular <= 20){
                // Enter regular page
                console.log('entering normal page (H r), world ' + req.session.worldNum);
                req.session.lowHigh = 'r';                                
                database.getDocsRandomOrder(req.session.worldNum, req.session.control, req.session.lowHigh, function(docs) {
                    res.render('index_influenced', {
                        docs: docs,
                        control: req.session.control,
                        lowHigh: req.session.lowHigh,
                        worldNum: req.session.worldNum,
                        cssFileName: 'style_test',
                        jsFileName: 'main',
                        showDownloads: 1
                    });
                });
            }else{
                // Enter controlled high influence page
                console.log('entering high influence page (H h), world ' + req.session.worldNum);
                req.session.lowHigh = 'h';
                database.getDocsSortedByDownloads(req.session.worldNum, req.session.control, req.session.lowHigh, function(docs){
                    res.render('index_influenced', {
                        docs: docs,
                        control: req.session.control,
                        lowHigh: req.session.lowHigh,
                        worldNum: req.session.worldNum,
                        cssFileName: 'style_test',
                        jsFileName: 'main',
                        showDownloads: 2
                    });
                });
            }
        }
    }

});

// Delete whenever
app.get('/test', function(req, res, next) {
    res.render('index_influenced');
});

// Submitting intro form to DB
app.post('/intro', function(req, res, next){
    database.startConnection();

    // Set it so that the user did the survey and now when they enter / it will bring them to the PDFs page (main page)
    req.session.didSurvey = true;

    var userData = {
        'hearAbout': req.body.hearAbout,
        'university': req.body.universityAffiliation,
        'psychField': req.body.psychSubfield,
        'timestamp': new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    // Store the userData and load the main page
    database.insertUserData(userData, function(result){
        // console.log(result);
        database.closeConnection();
        res.redirect('/');
        return;
    });
    
});

app.listen(process.env.PORT || 5000, '0.0.0.0', function() {
    console.log("Server running on 5000!");
});