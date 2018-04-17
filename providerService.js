const config = require('./config.js');
const urlBuilder = require('./urlBuilder')(config.baseMovieUrl, config.baseMoviesUrl);

module.exports =  config.providers.map((x)=> {
    return  {
        moviesUrl : urlBuilder.fullMoviesUrl(x),
        movieUrl : urlBuilder.fullMovieUrl(x)
    };
});