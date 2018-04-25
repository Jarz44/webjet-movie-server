const NodeCache = require('node-cache');
const _ = require('lodash');

const httpConfig = require('./config/httpConfig.js');

function moviesService(options) {    
    const cache = new NodeCache();

    const providerService = options.providers;
    const circuitBreakerService = options.circuitBreakers;

    circuitBreakerService.setFallbackBehaviour(handleFailover);

    const httpRequestHeaderOptions  = {
        'x-access-token' : httpConfig.token,
        'json': true, 
        'retries': 4
    }   
         
    return {

        getMovies: function() {
            let movieRequestUrls = providerService.getMoviesUrl();
          
            let moviesPromises = movieRequestUrls.map(url => makeRequest(url));
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
        return circuitBreakerService.fire(requestUrl, {headers: httpRequestHeaderOptions});    
    }

    function handleFailover(requestUrl) {
        return cache.get(requestUrl);
    }

    function buildMoviesList(data) {
        
        let dataResponses  = getDataFromResponses(data);        
        let movies = removeEmptyResults(dataResponses);
        let flattenedMovies = flattenResults(movies, "Movies");

        let groupedMovies = _.chain(flattenedMovies)
            .groupBy("Title")
            .toPairs()
            .map(function(currentItem) {
            return _.zipObject(["title", "providers"], currentItem);
        })
        .value(); 

        if(movies.length < 2) {
            throw new Error();
        }

        return groupedMovies;
    }

    function getMinimumCost(data) {
        let movies = [];
        let dataResponses = getDataFromResponses(data);
        let nonEmptydata = removeEmptyResults(dataResponses);
        if(nonEmptydata.length < dataResponses.length) {
            throw new Error();
        }
        return _.minBy(nonEmptydata, function(movie) {
            return parseFloat(movie.Price);
        });
    }

    function getDataFromResponses(data) {
        return data.map(x => getDataFromResponse(x));      
    }

    //data will either be the httpResponse or result of failover handler
    function getDataFromResponse(data) {
        var movies = []
        try {
            if(data !== undefined && data.statusCode === 200 ) {  
                movies = JSON.parse(data.body);
                cache.set(data.requestUrl, data.body);
            }
            else {
                movies = JSON.parse(data);
            }            
        } catch(err) {            
            console.log("Service down and no cached results");
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