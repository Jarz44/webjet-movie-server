const NodeCache = require('node-cache');

/*
    Simple wrapper for the cache used by other services

    Improvements:
    -determine an appropriate timeout value for cached values

*/
function cacheService() {
    const cache = new NodeCache({checkperiod: 3600});

    return {
        set: function(key, value) {
            return cache.set(key, value,);
        },
        get: function(key) {
            return cache.get(key);
        }
    }
}

module.exports = cacheService;