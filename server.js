
/*!
 * nodejs-express-mongoose-demo
 * Copyright(c) 2013 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , passport = require('passport')

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env]
  , mongoose = require('mongoose')

// Bootstrap db connection. Will move this some where else for multiple connections user, trip, parcel, etc
// Connect to mongodb
var connect = function () {
  var options = { 
    auto_reconnect: true,
    poolSize: 10,
    server: { 
      socketOptions: { 
        connectTimeoutMS:3600000,
        keepAlive:1,
        socketTimeoutMS:3600000
      } 
    } 
  }
  mongoose.connect(config.db, options)
}
connect()

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err)
})

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect()
})

// Bootstrap models
var models_path = __dirname + '/app/models/data'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// bootstrap passport config
require('./config/passport')(passport, config)

var app = express()

// express settings
require('./config/express')(app, config, passport)

app.get('*',function(req,res,next){
  if (req.headers['x-forwarded-proto'] == 'http'){
    res.redirect('http://' + req.headers.host + req.path)
  }else{
    next()
  }
})

// Bootstrap routes
require('./config/routes')(app, passport)

app.listen(config.port, config.ipaddr);
console.log('Express HTTP app started on ' + config.ipaddr + ' with port '+ config.port)

// expose app
exports = module.exports = app
