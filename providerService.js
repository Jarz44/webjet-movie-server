const config = require('./config/serviceConfig.js');
const _ = require('lodash');

function providersService(options) {

    const providers = options.providers;

    const baseMoviesUrls = providers.map(provider => options.baseMoviesUrl.replace('{0}', provider.name));
    const baseMovieDetailUrls = providers.map(provider => {        
        provider.detailMovieDetailsUrl = options.baseMovieDetailsUrl.replace('{0}', provider.name)
    });

   function getServiceWithId(id) {
        provider = _.find(providers, function(provider){
            return _.includes(id, provider.prefix);
        });

        return provider.detailMovieDetailsUrl.replace('{1}', id);        
    }


    return {
        getMoviesUrl: function() {
            return baseMoviesUrls;
        },

        getMovieDetailsUrl: function (ids) {            
            return ids.map(id => getServiceWithId(id));
        }      
    }

}

module.exports =  providersService;