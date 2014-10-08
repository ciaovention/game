var request = require('request')

const url = 'http://to.ly/api.php?longurl='

exports.get = function(longurl, cb){
  var options = {
    url: url + longurl,
    method: 'GET',
  }

  request(options, function(error, response, body) {
    parser(error, response, body, cb)
  })
}

/**
 * Parser for the result
 * @params {string} error
 * @params {string} response
 * @params {string} body
 * @params {function} callback
 */
function parser(error, response, body, callback) {
  if (!error && response.statusCode == 200)
    callback(error, body.trim()) 
  else
    callback(error+' '+response)
}