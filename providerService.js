const _ = require('lodash');

function providersService(options) {

    const providers = options.providers;

    const baseMoviesUrls = providers.map(provider => options.baseMoviesUrl.replace('{0}', provider.name));
    const baseMovieDetailUrls = providers.map(provider => {        
        provider.detailMovieDetailsUrl = options.baseMovieDetailsUrl.replace('{0}', provider.name)
    });
  
    return {
        getMoviesUrl: function() {
            return baseMoviesUrls;
        },

        getMovieDetailsUrl: function (ids) {            
            return ids.map(id => getServiceWithId(id));
        },
        
        getProviderName: function(id) {
           return getProvider(id).name;            
        },

        getProviderNames: function() {
            return providers.map(provider => provider.name);
        },

        getServiceIdentfier: function(url) {
            //is it a movies or detailed request
            let isMoviesRequest = _.includes(url, 'movies');
            let provider = _.find(providers, function(provider) {
                return _.includes(url, provider.name);
            });
            let suffix = isMoviesRequest? "" : "detailed";
            return provider.name + suffix;                 
        }
    }

    function getProvider(id) {
        return _.find(providers, function(provider){
            return _.includes(id, provider.prefix);
        });   
    }

    function getServiceWithId(id) {
        provider = getProvider(id);
        return provider.detailMovieDetailsUrl.replace('{1}', id);        
    } 

}

module.exports =  providersService;