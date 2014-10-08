/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema


/**
 * Games Schema
 * This collection is for storing each game
 */

var GameSchema = new Schema({
  player1: {type: String, lowercase: true, require: true, index: true},
  player2: {type: String, lowercase: true, require: true, index: true},
  score: {type: String,require: true},
	date: {type: Date, default: Date.now}
})

GameSchema.statics = {

  /**
   * Find games by name
   *
   * @param {String} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {} // {name: name}

    this.find(criteria)
      .sort({'date': 1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }
}

mongoose.model('Game', GameSchema)