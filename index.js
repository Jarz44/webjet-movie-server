const request = require('request');
const got = require('got');
const express = require('express');
const circuitBreaker = require('opossum');
const _ = require('lodash');

const config = require('./config.js');
const urlBuilder = require('./urlBuilder.js')(config.baseMovieUrl, config.baseMoviesUrl);

const options = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
}

const app = express();
var router = express.Router();
const url = config.baseurl;
var providers = [];

var providers = require('./providerService.js');

app.get('/movies', (req, res) => 
{
    let moviesPromises = providers.map(provider => getMovies(provider, options));      
    
    Promise.all(moviesPromises)
    .then(getDataFromResponses)
    .catch(console.error)
    .then(buildMoviesList)
    .catch(console.error)
    .then(movies => 
        res.send(movies)
    );  
         
})

app.listen(3000, () => console.log('Example app listening on port 3000!'));

function getMovies(provider, options) {
    const breaker = circuitBreaker(got.get, options); 
    
    breaker.fallback(() => {});
    breaker.on('fallback', (result) => console.log(result));

    return breaker.fire(provider.moviesUrl,{
        headers: {
            'x-access-token' : config.token,
            'json': true
        }
    });
}

function getDataFromResponses(data) {
    return data.map(x => getDataFromResponse(x));      
}

function getDataFromResponse(data) {
    if(data !== undefined)
    {
       return JSON.parse(data.body);
    }
    return [];
}

function buildMoviesList(data) {
    var flattenedMovies = [] ;
    var movies = [];   

    data.forEach(element => {
        if(element.length !== 0) movies.push(element);
    });  

    movies.forEach(element => {
        flattenedMovies = flattenedMovies.concat(element.Movies);
    });

    //flattenedMovies = _.groupBy(flattenedMovies, 'Title');

    var flattenedMovies = _.chain(flattenedMovies)
        .groupBy("Title")
        .toPairs()
        .map(function(currentItem) {
        return _.zipObject(["title", "providers"], currentItem);
    })
    .value(); 

    return flattenedMovies;
}

