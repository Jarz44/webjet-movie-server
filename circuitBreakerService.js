const circuitBreaker = require('opossum');
const _ = require('lodash');

function circuitBreakerService(options) {    
    let breakers = {}
    let action = options.action;
    let providerService = options.providers;

    const circuitBreakerOptions = {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000
    }    

    _.forEach(providerService.getProviderNames(), function (value) {
        let breaker1 = circuitBreaker(action, circuitBreakerOptions);        
        let breaker2 = circuitBreaker(action, circuitBreakerOptions);    
        breakers[value]  = breaker1;
        breakers[value+"detailed"] = breaker2;
    }); 

    return {
        fire: function(url, options) {
            let breakerId = providerService.getServiceIdentfier(url);
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
}

module.exports = circuitBreakerService;