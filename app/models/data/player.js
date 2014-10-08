/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema


/**
 * Players Schema
 * This collection is for storing player's info (score, count, average score)
 */

var PlayerSchema = new Schema({
  name: {type: String, lowercase: true, require: true, index: true},
  score: {type: Number},
  count: {type: Number},
  average: {type: average, index:true},
	update_at: {type: Date, default: Date.now}
})

PlayerSchema.statics = {

  /**
   * Find player by name
   *
   * @param {String} currency
   * @param {Function} cb
   * @api private
   */

  load: function (name, cb) {
    this.findOne({ name : name })
      .exec(cb)
  }

  /**
   * List players by average score
   *
   * @param {String} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {} // {name: name}

    this.find(criteria)
      .sort({'average': 1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }
}

mongoose.model('Player', PlayerSchema)