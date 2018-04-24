const express = require('express');
const serviceConfig = require("./config/serviceConfig.js");
const serverConfig = require("./config/serverConfig.js");


const providerService = require("./providerService.js")(serviceConfig);
const moviesService = require("./moviesService.js")({"providers": providerService});

const app = express();


app.use(function (req, res, next) {
    var allowedOrigins = serverConfig.allowedOrigins;
    
    var origin = req.headers.origin;

    if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
    }   
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    next();
});

app.get('/movies', (req, res) => 
{     
    moviesService.getMovies()   
    .then(movies => {
       return res.send(movies);
    })
    .catch(console.error);
});

app.get('/cost/:ids?', (req, res) => 
{   
    movieIds = req.query.ids.split(',');
    moviesService.getMinimumMovieCost(movieIds)
    .then((minimumMovieCost) => {
       return res.send(minimumMovieCost);
    })
    .catch(console.error);          
});

app.listen(serverConfig.port, () => console.log('Movie finder app listening on port ' + serverConfig.port+ '!'));