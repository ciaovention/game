var mongoose = require('mongoose')
  , User = mongoose.model('User')

exports.getOne = function(name, cb){
	isValid(name, cb)
}

var isValid = function(name,cb){
	name = (name || '').toLowerCase().substring(0, 18)
	name.replace('/[^0-9a-z_.]/i','')
	User.usernameNotExist(name,function(isEmpty){
		if(isEmpty && User.validate_username_format(name)){
			cb(name)
		}	
		else{
			name = (name.substring(0,16) + Math.random().toString(36).substring(2,4)).substring(0,18)
			isValid(name, cb)
		}	
	})
}