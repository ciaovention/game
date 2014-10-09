var mongoose = require('mongoose')
  , Player = mongoose.model('Player')
  , Game = mongoose.model('Game')

const PERPAGE = 10

/**
 * Find player by name
 */
exports.player = function (req, res, next, name){
	Player
	    .load(name, function (err, player) {
	      if (err) return next(err)
	      if (!player) return next(new Error('Failed to load player ' + name))
	      req.player = player
	      next()
	    })
}

/**
 * Show the player
 */
exports.show = function (req, res){

	var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
    var options = {
    	criteria: {'$or':[{player1: req.player.name},{player2: req.player.name}]},
    	perPage: PERPAGE,
    	page: page
  	}

	Game.list(options, function(err, games){
		if (err) return res.render('500')

		Game.count(options.criteria).exec(function (err, count) {
		  if (err) return res.render('500')

	      res.render('player/show', {
	        title: res.__('Player'),
	        player: req.player,
	        games: games,
	        page: page + 1,
	        pages: Math.ceil(count / PERPAGE)
	      })
	    })
	})
}

/**
 * List player by score
 */
exports.list = function (req, res){

	var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
    var options = {
    	criteria: {},
    	perPage: PERPAGE,
    	page: page
  	}

	Player.list(options, function(err, players){
		if (err) return res.render('500')

	    Player.count(options.criteria).exec(function (err, count) {
	      res.render('player/list', {
	        title: res.__('Player Ranking'),
	        players: players,
	        page: page + 1,
	        pages: Math.ceil(count / PERPAGE)
	      })
	    })
	})
}