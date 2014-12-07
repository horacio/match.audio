"use strict";
var parse = require('url').parse;
var Q = require('q');
var amazon = require('amazon-product-api');
var inspect = require('util').inspect

module.exports.id = "amazon";

if (!process.env.AWS_ID || !process.env.AWS_SECRET || !process.env.AWS_TAG) {
  console.warn("AWS_ID, AWS_SECRET or AWS_TAG environment variables not found, deactivating Amazon.");
  return;
}

var client = amazon.createClient({
  awsId: process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET,
  awsTag: process.env.AWS_TAG
});

module.exports.search = function(data) {
  var deferred = Q.defer();
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
    album = data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
    album = data.album.name;
  }

  client.itemSearch({
    keywords: query.replace(/[\(\[\]\)]/g, ""),
    searchIndex: 'MP3Downloads',
    responseGroup: 'ItemAttributes,Images,Tracks'
  }).then(function(results){
    if (results[0]) {
      var item = {
        service: 'amazon',
        type: 'album',
        id: results[0].ASIN[0],
        name: results[0].ItemAttributes[0].Title,
        streamUrl: null,
        purchaseUrl: results[0].DetailPageURL[0],
        artwork: results[0].LargeImage[0].URL[0],
        artist: {
          name: results[0].ItemAttributes[0].Creator[0]['_']
        }
      };
      if (results[0].ItemAttributes[0].ProductTypeName[0] == 'DOWNLOADABLE_MUSIC_TRACK') {
        item.album = {name: ""};
        item.type = "track";
      }
      deferred.resolve(item);
    }
  }).catch(function(err){
    console.log(err.Error);
  });
  return deferred.promise;
}

module.exports.match = function() {
  return false;
}
