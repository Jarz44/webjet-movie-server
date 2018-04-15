const request = require('request');
const axios = require('axios');
const express = require('express');
const app = express();

const config = require('./config.js');


var router = express.Router();
const url = config.baseurl;
let movieCount = 0;
var that;
app.get('/movies', (req, res) => 
{
    that = this;
    axios
        .get(config.baseMoviesUrl.replace('{0}', config.providers[0]),{
            headers: {
                'x-access-token' : config.token
            }
        })
        .then(response => {console.log(response)})
        .catch(error => {console.log(error)});
/*
    request({
        headers: {
            'x-access-token' : config.token
        },
        uri : config.baseMoviesUrl.replace('{0}', config.providers[0]),
        method: 'GET'

    }, function(err, response, body){   

        console.log('error: ', err);
        console.log(response);
        console.log(body.Movies);        

        var jsonObject = JSON.parse(body);
        that.movieCount = Object.keys(jsonObject.Movies).length;
        if(jsonObject !== undefined) {
            jsonObject.Movies.forEach(movie => {
                request({
                    headers: {
                        'x-access-token' : config.token
                    },
                    uri : config.baseMovieUrl.replace('{0}', config.providers[0]).replace('{1}', movie.ID),
                    method: 'GET'
                }, function(err, response, body){
                    body;
                });
                
            });
            res.send(jsonObject.Movies);
        }


        
    }); 
    */       
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))