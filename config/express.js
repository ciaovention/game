
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , flash = require('connect-flash')
  , winston = require('winston')
  , helpers = require('../lib/view-helpers')
  , pkg = require('../package.json')
  , i18n = require('i18n')

var env = process.env.NODE_ENV || 'development'

module.exports = function (app, config, passport) {

  // minimal config for i18n
  i18n.configure({
    locales: ['en','zh-cn', 'zh-tw'],
    defaultLocale: 'en',
    cookie: 'locale',
    directory: __dirname + '/locales'
  });

  app.set('showStackError', true)

  // should be placed before express.static
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
    },
    level: 9
  }))

  app.use(express.static(config.root + '/public'))

  // Logging
  // Use winston on production
  var log
  if (env !== 'development') {
    log = {
      stream: {
        write: function (message, encoding) {
          winston.info(message)
        }
      }
    }
  } else {
    log = 'dev'
  }
  // Don't log during tests
  if (env !== 'test') app.use(express.logger(log))

  // set views path, template engine and default layout
  app.set('views', config.root + '/app/views')
  app.set('view engine', 'jade')

  app.configure(function () {
    // expose package.json to views
    app.use(function (req, res, next) {
      res.locals.pkg = pkg
      res.locals.google_analytics = config.google_analytics
      next()
    })

    // cookieParser should be above session
    app.use(express.cookieParser())

    // bodyParser should be above methodOverride
    app.use(express.bodyParser())
    app.use(express.methodOverride())

    // express/mongo session storage, set expire in an hour
    
    app.use(express.session({
      secret: pkg.name,
      store: new mongoStore({
        url: config.db_session,
        collection : 'sessions'
      }),
      cookie:{maxAge: config.session_maxAge}
    }))


    // use passport session
    app.use(passport.initialize())
    app.use(passport.session())

    // connect flash for flash messages - should be declared after sessions
    app.use(flash())

    // should be declared after session and flash
    app.use(helpers(pkg.name))

    var csrf = express.csrf();

    var conditionalCSRF = function (req, res, next) {
      // Don't place csrf token on home page. For facebook canvas page
      if (req.path == "/") {
        next();
      } else {
        csrf(req, res, function(){
          res.locals.csrf_token = req.csrfToken()
          next()
        });
      }
    }

    // adds CSRF support
    if (process.env.NODE_ENV !== 'test') {
      app.use(conditionalCSRF)
    }

    app.use(i18n.init); // Should always before app.route
    
    // Set locale to zh-cn if request from wechat, renren, webo
    app.use(function (req, res, next) {
      var ua = req.header('user-agent')
      req.wechat = /micromessenger/i.test(ua) || env == 'development'
      next()
    })

    // routes should be at the last
    app.use(app.router)

    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next){
      // treat as 404
      if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next()
      }

      // log it
      // send emails if you want
      console.error(err.stack)

      // if not in development mode, redirect to home page
      if(env !== 'development')
        return res.redirect('/')

      // error page
      res.status(500).render('500', { error: err.stack })
    })

    // assume 404 since no middleware responded
    app.use(function(req, res, next){
      res.redirect('/')
      /*
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      })
      */
    })
  })

  // development env config
  app.configure('development', function () {
    app.locals.pretty = true
  })
}
