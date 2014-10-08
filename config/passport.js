var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , LinkedinStrategy = require('passport-linkedin').Strategy
  , WechatStrategy = require('passport-wechat').Strategy
  , User = mongoose.model('User')
  , Username = require('../lib/username')


module.exports = function (passport, config) {
  // require('./initializer')

  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user)
    })
  })

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      User.findOne({ email: email.toLowerCase() }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Unknown user' })
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' })
        }
        return done(null, user)
      })
    }
  ))

  // use wechat strategy
  passport.use(new WechatStrategy({
    appid: config.wechat.clientID,
    appSecret: config.wechat.clientSecret,
    state: true,
    callbackURL: config.host + config.wechat.callbackURL
    },
    function(openid, profile, token, done) {

        console.log(openid)
        console.log(profile)
        User.findOne({'$or':[{'wechat.id': profile.id}, {'email': profile.emails[0].value.toLowerCase()}]}, function (err, user) {
          if (!user) {
            username =  profile.name.familyName + profile.name.givenName
            Username.getOne(username, function(username){
              var job = profile._json.positions.values[0] || ''
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                username: username,
                provider: 'wechat',
                title: (job.company.name + ' ' + job.title).substring(0,50),
                bio: profile._json.summary.substring(0,140),
                wechat: {id: profile.id, accessToken: accessToken, profile: profile._json.publicProfileUrl}
              })

              var avatarUrl = profile._json.pictureUrls.values[0] || ''
              // Save facebook avatar and upload to S3, it's very slow should be unsynchronized
              user.saveAvatarFromSSO(avatarUrl, function(err){
                if (err) console.log(err)
                  return done(err, user)
              })
            })
          } else {
            if(typeof user.linkedin == 'undefined'){
              user.linkedin = {id: profile.id, accessToken: accessToken, profile: profile._json.publicProfileUrl}
              user.save()
            } 
            return done(err, user)
          }
        })
      }
    
  ));

  // use facebook strategy
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.host + config.facebook.callbackURL,
      passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, accessToken, refreshToken, profile, done) {

      // For Facebook connect
      if(req.user){
        user = req.user
        user.facebook = {id: profile.id, accessToken: accessToken}
        user.save(function (err) {
          if (err) console.log(err)
          return done(err, user)
        })
      }
      // Facebook login
      else{
        // Must check if email address is register or not
        User.findOne({'$or':[{'facebook.id': profile.id}, {'email': profile.emails[0].value.toLowerCase()}]}, function (err, user) {
          if (err) { return done(err) }
          if (!user) {
            Username.getOne(profile.username, function(username){
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                username: username,
                provider: 'facebook',
                facebook: {id: profile.id, accessToken: accessToken}
              })

              var avatarUrl = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=400&height=400" + "&access_token=" + accessToken
              // Save facebook avatar
              user.saveAvatarFromSSO(avatarUrl, function(err){
                if (err) console.log(err)
              })
              user.save(function (err) {
                if (err) console.log(err)
                return done(err, user)
              })
            })
          }
          else {
            if(typeof user.facebook == 'undefined'){
              user.facebook = {id: profile.id, accessToken: accessToken}
              user.save()
            } 
            return done(err, user)
          }
        })
      }
    }
  ));

  // use linkedin strategy
  passport.use(new LinkedinStrategy({
    consumerKey: config.linkedin.clientID,
    consumerSecret: config.linkedin.clientSecret,
    callbackURL: config.host + config.linkedin.callbackURL,
    passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    profileFields: ['id', 'first-name', 'last-name', 'email-address', 'pictureUrls::(original)', 'publicProfileUrl','summary','positions']
    },
    function(req, accessToken, refreshToken, profile, done) {
      // For linkedin connect
      if(req.user){
        user = req.user
        user.linkedin = {id: profile.id, accessToken: accessToken, profile: profile._json.publicProfileUrl}
        user.save(function (err) {
          if (err) console.log(err)
          return done(err, user)
        })
      }
      // linkedin login
      else{
        User.findOne({'$or':[{'linkedin.id': profile.id}, {'email': profile.emails[0].value.toLowerCase()}]}, function (err, user) {
          if (!user) {
            username =  profile.name.familyName + profile.name.givenName
            Username.getOne(username, function(username){
              var job = profile._json.positions.values[0] || ''
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                username: username,
                provider: 'linkedin',
                title: (job.company.name + ' ' + job.title).substring(0,50),
                bio: profile._json.summary.substring(0,140),
                linkedin: {id: profile.id, accessToken: accessToken, profile: profile._json.publicProfileUrl}
              })

              var avatarUrl = profile._json.pictureUrls.values[0] || ''
              // Save facebook avatar and upload to S3, it's very slow should be unsynchronized
              user.saveAvatarFromSSO(avatarUrl, function(err){
                if (err) console.log(err)
                //return done(err, user)
              })
              
              user.save(function (err) {
                if (err) console.log(err)
                return done(err, user)
              })
            })
          } else {
            if(typeof user.linkedin == 'undefined'){
              user.linkedin = {id: profile.id, accessToken: accessToken, profile: profile._json.publicProfileUrl}
              user.save()
            } 
            return done(err, user)
          }
        })
      }
    }
  ));
}