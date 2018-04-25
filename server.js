const express = require('express');
const got = require('got');
const serviceConfig = require("./config/serviceConfig.js");
const serverConfig = require("./config/serverConfig.js");


const providerService = require("./providerService.js")(serviceConfig);
const circuitBreakerService = require("./circuitBreakerService.js")({
    'action':got.get,
    "providers": providerService
});
const moviesService = require("./moviesService.js")({
    "providers": providerService,
    "circuitBreakers": circuitBreakerService
});

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
    .catch((data) => {
        console.error(data);       
        return res.send(404);
    });
});

app.get('/cost/:ids?', (req, res) => 
{   
    let movieIds = req.query.ids.split(',');
    moviesService.getMinimumMovieCost(movieIds)
    .then((minimumMovieCost) => {
       return res.send(minimumMovieCost);
    })
    .catch((data) => {
        console.error(data);       
        return res.send(404);
    });          
});

app.listen(serverConfig.port, () => console.log('Movie finder app listening on port ' + serverConfig.port+ '!'));