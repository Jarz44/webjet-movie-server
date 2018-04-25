const _ = require('lodash');


/*
    generates the urls required for hitting apis for a given set of providers
    allows other services to use the correct url and to get the provider for a given url just from an id
    

*/
function providersService(options) {

    const providers = options.providers;

    const baseMoviesUrls = providers.map(provider => options.baseMoviesUrl.replace('{0}', provider.name));
    const baseMovieDetailUrls = providers.map(provider => {        
        return provider.detailMovieDetailsUrl = options.baseMovieDetailsUrl.replace('{0}', provider.name)
    });

    const serviceIdentfiers = getServiceIdentifiers();    
  
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

        getServiceIdentifiers: function() {            
            return serviceIdentfiers;
        },

        getServiceIdentifier: function(url) {
            return getServiceIdentifier(url);
        },

        getNumberOfProviders: function() {
            return providers.length;
        }
    }

    function getServiceIdentifiers() {
        let moviesUrls = baseMoviesUrls.map(url => getServiceIdentifier(url));
        let movieDetailsUrls = baseMovieDetailUrls.map(url => getServiceIdentifier(url));
        return moviesUrls.concat(movieDetailsUrls);
    }

    function getServiceIdentifier(url) {
        //is it a movies or detailed request
        let isMoviesRequest = _.includes(url, 'movies');
        let provider = _.find(providers, function(provider) {
            return _.includes(url, provider.name);
        });
        let suffix = isMoviesRequest? "" : "detailed";
        return provider.name + suffix;  
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