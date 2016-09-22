var express = require('express');
var app = express();

var msAccKey = process.env.MS_ACC_KEY;

var Bing = require('node-bing-api')({
    accKey: msAccKey
});

var port = process.env.PORT || 8080;

// var MongoClient = require('mongodb').MongoClient;
// var mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/image-search';

// var collection;

// MongoClient.connect(mongoUrl, function(err, db) {
//     if (err) throw err;

//     // collection = db.collection('latestSearches');

// });

app.get('/api/imagesearch/:term', function(req, res) {
    var term = req.params.term;
    var offset = req.query.offset || 0;
    var resultCount = 10;
    var results;

    Bing.images(term, {
        top: resultCount,
        skip: offset * resultCount
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
        when: new Date().toISOString()
    };

});

app.get('/api/latest', function(req, res) {
    res.send(JSON.stringify('Test'));
});

app.listen(port, function() {
    console.log('Listening on port ' + port);
});