const SpotifyControl = require('spotify-control');
var spotifyPlaylist = require('spotify-playlist');
var jsonfile = require('jsonfile')

const holojam = require('holojam-node')(['sink']);

const express = require('express')
const app = express();

//starting from scene -1
var currentScene = -1;
const CHANGESCENELABEL = "sceneCounter";

//https://open.spotify.com/token
var spotify = new SpotifyControl({
    token: "NAowChgKB1Nwb3RpZnkSABoGmAEByAEBJa-WflkSFAX6MM1Z60JCwkNXdDeJLP_nhkch"
});

var playlistsbyroom = {};

playlistsbyroom['gifroom'] = "2ps1JXl3VuAovWrXlSugLI";
playlistsbyroom['artroom'] = "1tC1HYPw7erdeDNiKNEidi";
playlistsbyroom['gallery'] = "7h7g374FlkSW2x4cxIqyvA";
playlistsbyroom['rooftop'] = "7AsuP1UVERBKUkNjl3CZ0Y";
playlistsbyroom['projection'] = "6fhdszY4mFuKHqZA1JmTW3";
playlistsbyroom['or'] = "4x9kd1ZvbB9S2GjZN2o4Ye";
playlistsbyroom['vaporware'] = "0xPkzIXXbdkD0CDlFTZCcq";

//  'gallery',
//0xPkzIXXbdkD0CDlFTZCcq vaporware

//this is the order of the playlist
var playlists = [
  'rooftop',
  'projection',
  'gifroom',
  'artroom',
  'gifroom',
  'or',
  'rooftop',
  'projection',
  'gifroom',
  'artroom',
  'vaporware',
  'gallery'
]

var currentListID = "";

var playlistChangeCallback = function(err, result) {

    if(err) {
      console.log(err);
    }

    //offline online choise
    var filename = currentListID + ".json";
    if(!result.playlist) {
      jsonfile.readFile(filename, function(err, obj) {
          playRandomTrack(obj);
      })
    } else {
      jsonfile.writeFile(filename, result.playlist.tracks, function (err) {
        //console.error(err)
        playRandomTrack(result.playlist.tracks)
      })
    }


}

function playRandomTrack(tracks) {

  spotify.connect().then(v => {

      var tracknumtoplay = Math.floor((Math.random() * tracks.length) + 1);
       console.log("play track", tracks[tracknumtoplay].href);

      spotify.play(tracks[tracknumtoplay].href).then(v => {

        spotify.startListener(["play", "pause"]).on("event", data => {
          //  console.log(JSON.stringify(data, null, 4));
        });
      }, err => {
          console.log("ok err");
          console.error(err);
      });

  }, err => {
        console.error("Failed to start: " + err.message);
  })
}

function changePlaylist(playlistindex) {
  console.log("play list " + playlists[playlistindex]);
  currentListID = playlistsbyroom[playlists[playlistindex]];
  spotifyPlaylist.playlist('andrewdaffy', currentListID, playlistChangeCallback);
}

function chanePlaylistOffline(playlistindex) {

  currentListID = playlistsbyroom[playlists[playlistindex]];
  var filename = currentListID + ".json";

  console.log("play offline " + filename);
  jsonfile.readFile(filename, function(err, obj) {
      playRandomTrack(obj);
  })
}

// setTimeout( function() {
//     changePlaylist(10);
// },
// 3000);
//
// setTimeout( function() {
//     changePlaylist(11);
// },
// 10000);
//
// setTimeout( function() {
//     changePlaylist(12);
// },
// 20000);
//
// setTimeout( function() {
//     changePlaylist(3);
// },
// 30000);
//
// setTimeout( function() {
//     changePlaylist(4);
// },
// 40000);
//
// setTimeout( function() {
//     changePlaylist(5);
// },
// 50000);
//
// setTimeout( function() {
//     changePlaylist(6);
// },
// 60000);

holojam.on('update', (flakes, scope, origin) => {
  flakes.forEach(function(flake){

    if(flake.label === CHANGESCENELABEL){
        //console.log("change scene");
        if(currentScene != flake.ints[0]) {
         console.log("change scene to " + flake.ints[0]);
          currentScene = flake.ints[0];
          chanePlaylistOffline(currentScene);
        }
    //  console.log("label:" + flakes[0].label + "\tints:" + flakes[0].ints[0]);
    }
  });

});
