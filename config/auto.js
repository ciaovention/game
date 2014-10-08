
// Get ajax controller
exports.controller = function(req, res, next, controller){
  try{
    req._controller = require('../app/controllers/ajax/' + controller)
  }catch(e){
    return next(new Error('Page not found'))
  }
  next()
}

// Get action
exports.action = function(req, res, next, action){
	req._dispatch = req._controller[action]
    next()
  }

// Dispatch
exports.dispatch = function(req,res){
	if (typeof(req._dispatch) == 'function')
    	req._dispatch(req,res)
    else
    	res.render('404')
}

