const circuitBreaker = require('opossum');
const _ = require('lodash');

/*  
    This is the circuit breaker service which is intended to be used
    with an appropriate httprequest library for initiating requests to 3rd party apis
    It utilises the providerService to ensure a cicuit breaker is created for each service

    Improvements: 
    -allowing individual services to have circuit breakers tuned to their
    individual needs
    -Better handling the fallback state so the logging it provides better information
*/
function circuitBreakerService(options) {    
    let breakers = {}
    let action = options.action;
    let providerService = options.providers;

    const circuitBreakerOptions = {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000
    }    

    generateBreakers();

    return {
        fire: function(url, options) {
            let breakerId = providerService.getServiceIdentifier(url);
            return breakers[breakerId].fire(url, options);
        },
        setFallbackBehaviour: function(action) {
            _.forEach(breakers, function(value) {
                value.fallback((requestUrl) => 
                {                  
                    return action(requestUrl);
                });
            });
        }
    }

    function generateBreakers()  {
        _.forEach(providerService.getServiceIdentifiers(), function (value) {
            let breaker = circuitBreaker(action, circuitBreakerOptions);    
            breakers[value]  = breaker;
        }); 
    }
}

module.exports = circuitBreakerService;