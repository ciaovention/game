var env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Twit = require('twit')

function postMessage(access_token, access_token_secret, message) {
    var T = new Twit({
	    consumer_key: config.twitter.clientID
	  , consumer_secret: config.twitter.clientSecret
	  , access_token: access_token
	  , access_token_secret: access_token_secret
	})

	T.post('statuses/update', { status: message }, function(err, data, response) {
		if(err) console.log(err)
	})
}

exports.postMessage = postMessage;