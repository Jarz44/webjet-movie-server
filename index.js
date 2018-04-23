const request = require('request');
const express = require('express');
const config = require("./config/serviceConfig.js")

const providerService = require("./providerService.js")(config);
const moviesService = require("./moviesService.js")({"providers": providerService});

const app = express();

app.get('/movies', (req, res) => 
{     
    moviesService.getMovies()   
    .then(movies => {
       return res.send(movies)
    })
    .catch(console.error);
})

app.get('/cost/:ids?', (req, res) => 
{   
    movieIds = req.query.ids.split(',');
    moviesService.getMinimumMovieCost(movieIds)
    .then((minimumMovieCost) => {
       return res.send(minimumMovieCost)
    })
    .catch(console.error);          
})

app.listen(3000, () => console.log('Example app listening on port 3000!'));