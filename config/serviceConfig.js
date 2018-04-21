module.exports = {
    'baseMoviesUrl': 'https://webjetapitest.azurewebsites.net/api/{0}/movies',
    'baseMovieDetailsUrl': 'https://webjetapitest.azurewebsites.net/api/{0}/movie/{1}',
    'providers': [
                    {
                        'name': 'cinemaworld', 
                        'prefix': 'cw'
                    },
                    {   
                        'name': 'filmworld', 
                        'prefix':'fw'
                    }
                ]
}