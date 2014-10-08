/*!
 * Module dependencies.
 */

//var async = require('async')

/**
 * Controllers
 */

var page = require('../app/controllers/page')
  , game = require('../app/controllers/game')
  , dashboard = require('../app/controllers/dashboard')
  , auth = require('./middlewares/authorization')
  , auto =require('./auto')

/**
 * Route middlewares
 */

var userAuth = [auth.requiresLogin, auth.user.emailConfirmed, auth.user.stipeConnected]

/**
 * Ajax controllers need to authenticate
 */
var ajaxAuthControllers = ["stripe", "recipients", "request"];
var ajaxAuth = function(req, res, next, controller){
  var exist = ajaxAuthControllers.indexOf(controller);
  if(exist >= 0)
    auth.requiresLogin(req, res, next)
  else
    next()
}

/**
 * Set returnTo for facebook, google, twitter, linkedin connect
 */

var returnTo = function(req, res, next){
  if(req.query.returnto)
    req.session.returnTo = req.query.returnto
  next()
}

/**
 * Expose routes
 */

module.exports = function (app, passport) {

  // game routes
  app.get('/game/new', game.new)
  app.post('/game/new', game.create)

  // player routes
  app.get('/player/:name', player.show)
  app.param('name', player.player)
  app.get('/players', player.list)

  // board route
  app.get('/board', player.top)

  // home route
  app.all('/', page.index)

  app.param('controller', ajaxAuth, auto.controller)
  app.param('action', auto.action)
  app.all('/:controller/:action', auto.dispatch)
  app.all('/a/:controller/:action', auto.dispatch)

}
