require('dotenv').config();

// setting up the calls to the apis
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");


// node packages to complete some of the required functionality on this 
var inquirer = require("inquirer");
var request = require("request");
var keys = require("./keys.js");
var fs = require('fs')

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var enteredData = process.argv[2];

var songSearch = (song) => {
    inquirer.prompt([
        {
            type: "input",
            name: "song",
            message: "What is the title of the song you are looking for?"
        }
    ]).then(function (answers) {

        if (answers.song === '') {
            answers.song = song;
        }

        spotify.search({ type: 'track', query: answers.song, limit: 5 }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }

            data.tracks.items.forEach(function (songInfo) {
                console.log("-------------------");
                console.log(`Artist: ${songInfo.album.artists[0].name}`);
                console.log(`Song Name: ${songInfo.name}`);
                console.log(`Album Name: ${songInfo.album.name}`);
                console.log(`Spotify Link: ${songInfo.album.external_urls.spotify}`);

                fs.appendFile("log.txt", `\n${songInfo.album.artists[0].name}\n${songInfo.name}`, function (err) {
                    if (err) { console.log(err); }
                })
                fs.appendFile("log.txt", `\n-----------`, function (err) {
                    if (err) console.log(err);
                })
            })
        });
    })
}

var printTweets = () => {
    var params = {
        screen_name: '@tupacmanity1',
        count: 20
    };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            tweets.forEach(function (userTweets) {
                console.log("-----------")
                console.log(userTweets.created_at);
                console.log(userTweets.text);
                console.log("-----------")

                fs.appendFile("log.txt", `\n${userTweets.text}`, function (err) {
                    if (err) { console.log(err); }
                })
                fs.appendFile("log.txt", `\n-----------`, function (err) {
                    if (err) console.log(err);
                })
            })
        } else {
            console.log(error)
        }
    });
}

var movieSearch = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "Enter a movie title to search for."
        }
    ]).then(function (answers) {
        if (answers.title === '') {
            answers.title = "Mr. Nobody";
        }
        request(`http://www.omdbapi.com/?t=${answers.title}&y=&plot=short&apikey=trilogy`, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                console.log("-------------------")
                console.log(JSON.parse(body).Title);
                console.log(JSON.parse(body).Year);
                console.log("imdb Rating: " + JSON.parse(body).Ratings[0].Value);
                console.log("Rotten Tomatoes Score: " + JSON.parse(body).Ratings[1].Value);
                console.log(JSON.parse(body).Country);
                console.log(JSON.parse(body).Language);
                console.log(JSON.parse(body).Plot);
                console.log(JSON.parse(body).Actors);
                console.log("-------------------")

                fs.appendFile("log.txt", `\n${JSON.parse(body).Title}`, function (err) {
                    if (err) { console.log(err); }
                })
                fs.appendFile("log.txt", `\n-----------`, function (err) {
                    if (err) console.log(err);
                })
            } else { console.log(error) }
        });
    })
}

var log = (enteredData) => {
    fs.appendFile("log.txt", `\n${enteredData}`, function (err) {
        if (err) { console.log(err); }
    })
}

switch (enteredData) {
    case "my-tweets":
        //call twitterAPI to retrieve 20 most recent tweets
        log(enteredData);
        printTweets();
        break;

    case "spotify-this-song":
        log(enteredData);
        songSearch();
        //pull spotify data
        break;

    case "movie-this":
        log(enteredData);
        movieSearch();
        break;

    case "do-what-it-says":
        log(enteredData);
        fs.readFile("random.txt", "utf8", function (error, data) {
            if (error) {
                return console.log(error);
            } else {
                let song = data.split(",")
                console.log("Press Enter To Continue")
                songSearch(song[1]);
            }
        })
        break;

}