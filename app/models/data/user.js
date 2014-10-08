/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , oAuthTypes = ['twitter', 'facebook', 'google', 'linkedin']
  , Mail = require('../../mailer')
  , Imager = require('imager')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../../config/config')[env]
  , imagerConfig = require(config.root + '/config/imager')
  , gm = require('gm').subClass({ imageMagick: true})
  , verfiyItems = require(config.root + '/config/verifyItems')

require('date-utils')

const EMAIL_VER_HASHKEY = 'XFUSQxuEhALaaKh95wZRgM3tznhN2Z2h'
  , USERNAME_FORMAT = /^[a-zA-Z0-9_.]{3,18}$/i
  , AVATAR_LARGE = 400
  , AVATAR_THUMBNAIL = 150
  , AVATAR_DIRECTORY = 'avatar/'
  , DEFAULT_AVATAR = 'images/default-avatar.gif'

/**
 * User Schema
 */

var UserSchema = new Schema({
  name : { type: String, required: true, match:/^.{0,20}$/},
  email : { type: String, lowercase: true, index: true, match:/^.{0,100}$/},
  username : { type: String, lowercase: true, required: true, index: {unique: true}, match:/^.{0,20}$/},
  provider : { type: String },
  h_pwd : { type: String}, // hashed_password
  salt : { type: String},
  authToken : { type: String},
  title : { type: String, match:/^.{0,50}$/},
  phone : { type: String, default:'', match:/^.{0,100}$/},
  address : { type: String, match:/^.{0,100}$/},
  website : { type: String, match:/^.{0,100}$/},
  wechat : { type: String, match:/^.{0,50}$/},
  city : { type: String, match:/^.{0,100}$/},
  province: { type: String, match:/^.{0,100}$/},
  country : { type: String, match:/^.{0,100}$/},
  postal_code : { type: String, match:/^.{0,100}$/},
  bio : { type: String, match:/^.{0,200}$/},
  resume : {type: String, match:/^.{0,2000}$/},
  shorturl : {type: String},
  gender : { type: String, enum:['m','f','o']},
  birth : { type: String},
  lang : { type : String},
  em_verif : { type: String},
  c_at : { type : Date, default : Date.now, index : true},// create at
  em_not: {
    bounced: { type: Number} // email address bounced
  },
  stats:{
    views: {type: Number, default: 0}
  },
  avatar : {},
  has_avatar: {type: Number, index: true},
  facebook : {},
  twitter : {},
  google : {},
  linkedin : {},
  wechat : {},
  pass_rest: {
    url_key: { type: String},
    reset_key: { type: String},
    c_at: { type : Date},
    e_at: { type : Date}
  }
})

/**
 * Indexes
 */
UserSchema.index({ 'facebook.id': 1});
UserSchema.index({ 'twitter.id': 1});
UserSchema.index({ 'google.id': 1});
UserSchema.index({ 'linkedin.id': 1});

/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.h_pwd = this.encryptPassword(password)
  })
  .get(function() { return this._password })

UserSchema
  .virtual('rating')
  .set(function(rating){
    this._rating = rating
  })
  .get(function() { 
    return this._rating
  })

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

// the below 5 validations only apply if you are signing up traditionally

UserSchema.path('name').validate(function (name) {
  if (this.doesNotRequireValidation()) return true
  return name.length
}, 'Name cannot be blank')

UserSchema.path('email').validate(function (email) {
  if (this.doesNotRequireValidation()) return true
  return email.length
}, 'Email cannot be blank')

UserSchema.path('email').validate(function (email) {
  if (this.doesNotRequireValidation()) return true
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}, 'Email is invalid')

UserSchema.path('email').validate(function (email, fn) {
  if (this.doesNotRequireValidation()) fn(true)

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
     UserSchema.statics.emailNotExist(email, fn)
  } else fn(true)
}, 'Email already exists')

UserSchema.path('username').validate(function (username) {
  if (this.doesNotRequireValidation()) return true
  return username.length
}, 'Username cannot be blank')

UserSchema.path('username').validate(function (username) {
  if (this.doesNotRequireValidation()) return true
  return UserSchema.statics.validate_username_format(username)
}, 'Username format incorrect. Alphanumerics, "." and "_" only.')

UserSchema.path('username').validate(function (username, fn) {
  if (this.doesNotRequireValidation()) fn(true)

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('username')) {
    UserSchema.statics.usernameNotExist(username, fn)
  } else fn(true)
}, 'Username already exists')

UserSchema.path('h_pwd').validate(function (h_pwd) {
  if (this.doesNotRequireValidation()) return true
  return h_pwd.length
}, 'Password cannot be blank')


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (!validatePresenceOf(this.password)
    && !this.doesNotRequireValidation())
    next(new Error('Invalid password'))
  else{
    this.em_verif = this.createEmailVerifyHash()
    // Send verify email to new user
    Mail.verify_email(this)
  }
  next()
})

/**
 * Methods
 */

UserSchema.methods = {
  /**
   * Save user and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

  uploadAndSave: function (image, cb) {
    if (!image || !image.size) return this.save(cb)

    var self = this

    this.resizeAvatarToCrop(imagerConfig, image.path, function(err, imagerConfig){
      if(err)
        return cb(err)

      var imager = new Imager(imagerConfig, 'S3')
      
      if(self.avatar){
        var file = self.avatar

        // if there is avatar associated with the item, remove from the cloud too
        imager.remove([file], function (err) {
          if (err) return cb(err)
        }, 'avatar')
      }
      
      self.validate(function (err) {
        if (err) return cb(err);
        imager.upload([image], function (err, cdnUri, files) {
          if (err) return cb(err)
          if (files.length) {
            self.avatar = files[0]
            self.has_avatar = 1
          }
          self.save(cb)
        }, 'avatar')
      })
    })    
  },

  /**
   * Save avatar from SSO
   */
  saveAvatarFromSSO: function(imageUrl, cb){
    if(!imageUrl) return cb
    var self = this
    var tempFile = self.id
    downloadAvatar(imageUrl, tempFile, function(err, newFilename){
      if (err) return cb(err)
      self.resizeAvatarToCrop(imagerConfig, newFilename, function(err, imagerConfig){
        self.validate(function (err) {
          if (err) return cb(err)
          var imager = new Imager(imagerConfig, 'S3')
          imager.upload([newFilename], function (err, cdnUri, files) {
            if (err) return cb(err)
            if (files.length) {
              self.avatar = files[0]
              self.has_avatar = 1
            }
            self.save(cb)
          }, 'avatar')
        })
      })
    }) 
  },

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.h_pwd
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return ''
    var encrypred
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encrypred
    } catch (err) {
      return ''
    }
  },

  /**
   * Create email verification hash
   *
   * @return {String}
   */
  createEmailVerifyHash: function() {
    var data = this.makeSalt() + this.username + EMAIL_VER_HASHKEY
    data = data.substring(0,24)
    var cipher = crypto.createCipheriv('bf-ecb', EMAIL_VER_HASHKEY, '')
    return encodeURIComponent((cipher.update(data, 'utf8', 'base64') + cipher.final('base64')).replace(/\//g,'').trim())
  },

  /**
   * Validation is not required if using OAuth
   */

  doesNotRequireValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  },

  /**
   * Change password
   */
  changePassword: function(new_password, confirm_password) {
    if(validatePresenceOf(new_password) && validatePresenceOf(confirm_password) && new_password === confirm_password){
      this.salt = this.makeSalt()
      this.h_pwd = this.encryptPassword(new_password)
      this.save(function(err){
        return err
      })
    }else{
      return new Error('Invalid new password')
    }
  },

  /**
   * Generate the reset keys and create a password reset record for the user
   */
  generateResetKeys: function(cb){
    this.removeResetKeys()

    var secure_random_string = crypto.randomBytes(20).toString('base64').substring(0,20)
    var base = crypto.createHash('md5').update(this.c_at.toString() + this.h_pwd).digest('hex')
    var url_key = crypto.createHash('sha1').update(secure_random_string + base).digest('hex')

    var date = new Date()
    var expire_at = date.setDate(date.getDate() + 1)

    this.pass_rest.url_key = url_key
    this.pass_rest.reset_key = url_key
    this.pass_rest.c_at = new Date().toISOString()
    this.pass_rest.e_at = expire_at

    this.save(cb)
  },

  /**
   * Check if reset key is valid
   */
  validateResetKey: function(key){
    if(typeof(this.pass_rest) != 'undefined' && this.pass_rest.url_key == key)
      return true
    else
      return false
  },

  /**
   * Remove user reset key
   */
  removeResetKeys: function(){
    this.set('pass_rest', undefined, {strict: false})
    this.save()
  },

  /**
   * Get user avatar
   */
  getAvatar: function (type) {
    type = type || 'thumbnail'
    return imagerConfig.storage.S3.cdn+'/'+
      ((this.avatar) ? AVATAR_DIRECTORY+type+'_'+this.avatar : DEFAULT_AVATAR)
  },

  /**
   * Get resize user avatar config for imager to crop
   * thumb 150x150
   * large 400x400
   */
  resizeAvatarToCrop: function(imagerConfig, imageFilePath, cb){
    // obtain the size of an image
    gm(imageFilePath)
    .size(function (err, size) {
      // Resize the right resolution to crop in center
      if (!err) {
        if(size.width >= size.height){
          imagerConfig.variants.avatar.resizeAndCrop.large.resize = (size.width/size.height * AVATAR_LARGE).toString() + 'x' + AVATAR_LARGE.toString()
          imagerConfig.variants.avatar.resizeAndCrop.thumbnail.resize = (size.width/size.height * AVATAR_THUMBNAIL).toString() + 'x' + AVATAR_THUMBNAIL.toString()
        }
        else{
          imagerConfig.variants.avatar.resizeAndCrop.large.resize = AVATAR_LARGE.toString() + 'x' + (size.height/size.width * AVATAR_LARGE).toString()
          imagerConfig.variants.avatar.resizeAndCrop.thumbnail.resize = AVATAR_THUMBNAIL.toString() + 'x' + (size.height/size.width * AVATAR_THUMBNAIL).toString()
        }
      }
      // Set avatar directory
      imagerConfig.storage.uploadDirectory = AVATAR_DIRECTORY
      cb(err, imagerConfig)
    })
  },

  /**
   * Get user verify percent
   */
  getUserVerifyPercent: function(){
    var score = getScore(this, verfiyItems)
    var total = Object.keys(verfiyItems).length
    return Math.round(score/total * 100)
  }
}

/**
 * Static methond
 */
UserSchema.statics = {
  /**
   * Create email verification hash
   *
   * @return {String}
   */
  validate_username_format: function(username){
    return USERNAME_FORMAT.test(username)
  },

  emailNotExist : function(email, cb){
    var User = mongoose.model('User')
    User.find({ email: email }).exec(function (err, users) {
      cb(!err && users.length === 0)
    })

  },

  usernameNotExist : function(username, cb){
    var User = mongoose.model('User')
    User.find({ username: username }).exec(function (err, users) {
      cb(!err && users.length === 0)
    })
  },

  /**
   * Find user by id or username
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    var query = /^[0-9a-fA-F]{24}$/.test(id) ? {_id: id} : {username: id}
    this.findOne(query)
      .exec(cb)
  },

  /**
   * List users
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}
    this.find(criteria)
      .sort({'c_at': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }
}

/**
 * Download user avatar from SSO
 * @param {String} uri: the image url
 * @param {String} filename
 * @param {Function} callback
 */
var fs = require('fs'),
  request = require('request')

var downloadAvatar = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    var file = '/tmp/'+filename
    request(uri).pipe(fs.createWriteStream(file)).on('close', function(err){
      var type = detectImageType(file)
      var newFilename = file+'.'+type
      fs.rename(file, newFilename, function (err) {
        return callback(err, newFilename)
      })
    })
  })
}

/**
 * Detect image type from SSO, sometime there is no image extension
 * @param {String} filename
 * @return {String} image type
 */
var detectImageType = function(filename){
  var readChunk = require('read-chunk'); // npm install read-chunk
  var imageType = require('image-type');
  var buffer = readChunk.sync(filename, 0, 12);

  return imageType(buffer);
}

/**
 * Recursive function to calculate score
 * @param {Object} user: user Object to be checked
 * @param {Object} items: The items need to check
 * @return {int} score
 */
var getScore = function(user,items){
  var score = 0
  for(var key in items){
    if (items.hasOwnProperty(key)) {
      switch(typeof items[key]){
        case 'string':
          if(user[key] === items[key])
            score++
          break;
        case 'boolean':
          if(Boolean(user[key]) == items[key])
            score++
          break;
        case 'object':
          if(typeof user[key] === 'object')
            score += getScore(user[key],items[key])
          break
      }
    }
  }
  return score
}

mongoose.model('User', UserSchema)