var mongoose = require('mongoose')
  , Game = mongoose.model('Game')
  , Player = mongoose.model('Player')
  , async = require('async')


exports.new = function (req, res){
	res.render('game/new', {
	    title: res.__('New_Game'),
	    game: new Game({}),
	    info: req.flash('info'),
	    errors: req.flash('error')
	})
}

exports.create = function (req, res){

	console.log(req.body)

	req.body.score = req.body.score1 + ':' +req.body.score2

	var game = new Game(req.body)
	game.save(function(err){
		if (err) {
            return res.render('game/new', {
			    title: res.__('New_Game'),
			    game: new Game({}),
			    errors: [err]
			})
        }

        async.parallel({
		    one: function(callback){
		        updatePlayer(req.body.player1, req.body.score1, req.body.score2, function(err){
		        	callback(err)
		        })
		    },
		    two: function(callback){
		        updatePlayer(req.body.player2, req.body.score2, req.body.score1, function(err){
		        	callback(err)
		        })
		    }
		},
		function(err, results) {
		    if(err || results.one || results.two){
		    	return res.render('game/new', {
				    title: res.__('New_Game'),
				    game: new Game({}),
				    errors: [err,results.one,results.two]
				})
		    }

		    return res.redirect('/')
		});
	})

}

function updatePlayer(name,score1, score2, cb){
	Player.load(name, function(err, player){
		if(err) return cb(err)

		if(player){
			player.score+= score1 - score2
	    	player.count++
	    	player.average = (player.score/player.count).toFixed(2)
		}else{
			var data = {
				name: name,
				score: score1 - score2,
				count: 1,
				average: score1 - score2
			}
			var player = new Player(data)
		}
		player.save(cb)
    })
}