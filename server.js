var express = require('express');
var app = express();
app.set('views', './views');
app.set('view engine', 'pug');

var Bing = require('node-bing-api')({
    accKey: process.env.MS_ACC_KEY
});

var port = process.env.PORT || 8080;
var appUrl = process.env.APP_URL || '[APP URL]';

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/image-search';

var collection;

MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;

    collection = db.collection('latestSearches');

    app.listen(port, function() {
        console.log('Listening on port ' + port);
    });
});

app.get('/api/imagesearch/:term', function(req, res) {
    var term = req.params.term;
    var offset = req.query.offset || 0;
    var resultCount = 10;
    var skipCount = offset * resultCount;
    var results;

    Bing.images(term, {
        top: resultCount,
        skip: skipCount
    }, function(error, response, body) {
        if (error) throw error;

        results = body.d.results.map(function(result) {
            return {
                url: result.MediaUrl,
                snippet: result.Title,
                thumbnail: result.Thumbnail.MediaUrl,
                context: result.SourceUrl
            };
        });

        res.send(JSON.stringify(results));
    });

    var searchData = {
        term: term,
        when: new Date()
    };

    collection.insertOne(searchData, function(err, result) {
        if (err) throw err;
    });
});

app.get('/api/latest/imagesearch', function(req, res) {
    collection.find({}, {
        _id: 0
    }).limit(10).sort({when: -1}).toArray(function(err, docs) {
        if (err) throw err;

        res.send(JSON.stringify(docs));
    });
});

app.get('/', function(req, res) {
    
    res.render('index', { appUrl });
});