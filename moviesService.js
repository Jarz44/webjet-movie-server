const got = require('got');
const circuitBreaker = require('opossum');
const _ = require('lodash');

const httpConfig = require('./config/httpConfig.js');

function moviesService(options) {    

    const providerService = options.providers;

    const circuitBreakerOptions = {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000
    }

    const httpRequestHeaderOptions  = {
        'x-access-token' : httpConfig.token,
        'json': true, 
        'retries': 4
    }   
         
    return {

        getMovies: function() {

            let moviesPromises = providerService.getMoviesUrl().map(url => makeRequest(url));
            return Promise.all(moviesPromises)
            .then(data => {
                return buildMoviesList(data);
            });       
        },       
        
        getMinimumMovieCost: function(ids) {
            let promises = providerService.getMovieDetailsUrl(ids).map(url => makeRequest(url));
            return Promise.all(promises)
            .then(data => {
                let movie = getMinimumCost(data);
                if(movie) {
                    movie["Provider"] = providerService.getProviderName(movie.ID);
                }
                return movie;
            });  
        }         
    }

    function makeRequest(requestUrl) {
        const breaker = circuitBreaker(got.get, circuitBreakerOptions); 
            
        breaker.fallback((data) => data);
        breaker.on('fallback', (result,e,x) => console.log(result,e));

        return breaker.fire(requestUrl,{
            headers: 
                httpRequestHeaderOptions
            
        });
    }

    function buildMoviesList(data) {

        let flattenMovies = [];
        let movies = [];
        movies = getDataFromResponses(data);                       
        movies = removeEmptyResults(movies);
        movies = flattenResults(movies, "Movies");

        flattenedMovies = _.chain(movies)
            .groupBy("Title")
            .toPairs()
            .map(function(currentItem) {
            return _.zipObject(["title", "providers"], currentItem);
        })
        .value(); 

        return flattenedMovies;
    }

    function getMinimumCost(data) {
        let movies = [];
        data = getDataFromResponses(data);
        data = removeEmptyResults(data);
        return _.minBy(data, 'Price');
    }

    function getDataFromResponses(data) {
        return data.map(x => getDataFromResponse(x));      
    }

    function getDataFromResponse(data) {
        var movies = []
        if(data !== undefined && data.statusCode === 200 )
        {  
            movies = JSON.parse(data.body);               
        }
        return movies;
    }        
    
    function removeEmptyResults(data) {
        nonEmptyResults = []
        data.forEach(element => {
            if(element.length !== 0) nonEmptyResults.push(element);
        });
        
        return nonEmptyResults;
    }

    function flattenResults(data, key) {
        let flattenedResults =[];
        
        flattenedResults= [].concat.apply([], data.map(x => x[key]));
        
        return flattenedResults;
    }
}

module.exports = moviesService;