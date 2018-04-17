module.exports =  function urlBuilder(baseMovieUrl, baseMoviesUrl){
    return {
        fullMovieUrl : function fullMovieUrl(provider){
            return baseMovieUrl.replace('{0}', provider);
        },
        fullMoviesUrl : function fullMoviesUrl(provider){
            return baseMoviesUrl.replace('{0}', provider);
        }
    }
}