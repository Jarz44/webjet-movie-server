const express = require('express');
const got = require('got');
const serviceConfig = require("./config/serviceConfig.js");
const serverConfig = require("./config/serverConfig.js");
const httpConfig = require("./config/httpConfig");

const cacheService = require("./services/cacheService")();
const providerService = require("./services/providerService.js")(serviceConfig);
const circuitBreakerService = require("./services/circuitBreakerService.js")({
    'action':got.get,
    "providers": providerService
});
const moviesService = require("./services/moviesService.js")({
    "httpConfig": httpConfig,
    "providers": providerService,
    "circuitBreakers": circuitBreakerService,
    "cache": cacheService
});

const app = express();

/*
    Movie finder app
    routes calls to movies service 
    provides a list of movies
    and the cheapest movie for a given set of ids

    Improvements:
    -needs unit testing
    -needs better dependency injection
    -needs more thought given on how to handle errors 
     and the stus codes used
    -logging everywhere needs to be better thought out
    -ability to have a config for prod and dev like angular
*/
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
    moviesService.getMinimumCostMovie(movieIds)
    .then((minimumCostMovie) => {
       return res.send(minimumCostMovie);
    })
    .catch((data) => {
        console.error(data);       
        return res.send(404);
    });          
});

app.listen(serverConfig.port, () => console.log('Movie finder app listening on port ' + serverConfig.port+ '!'));