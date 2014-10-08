var env = process.env.NODE_ENV || 'development'
	, config = require('../../config/config')[env]
	, mandrill = require('node-mandrill')(config.mandrill_key)
	, helper = require('../../lib/helper')
	, jade = require('jade')
	, i18n = require('i18n')

var locale

exports.verify_email = function(user,cb){
	// set email language
	setLocale(user.lang || 'zh-cn')

	var locals = {
        user: user,
        title: __('email_verify_email_title'),
        link: config.host+'/verify/'+user.em_verif+'/'+user._id
      }

	mandrill('/messages/send', {
	    message: {
	        to: [{email: user.email, name: user.name}],
	        from_email: 'info@wcard.co',
	        from_name: __('wcard'),
	        subject: __('email_verify_email_title'),
	        text: processTemplate('verify_email/text',locals),
	        html: processTemplate('verify_email/html',locals),
	        tags:['verify_email']
	    }
	}, function(error, response){
		responseHandler(error, response, user)
	});
}

exports.forgot_password = function(user,cb){
	// set email language
	setLocale(user.lang)
	
	locals = {
        user: user,
        title: __('email_reset_password_title'),
        link: config.host+'/reset_password/'+user.pass_rest.url_key
      }
	mandrill('/messages/send', {
	    message: {
	        to: [{email: user.email, name: user.name}],
	        from_email: 'info@wcard.co',
	        from_name: __('wcard'),
	        subject: __('email_reset_password_title'),
	        text: processTemplate('forgot_password/text',locals),
	        html: processTemplate('forgot_password/html',locals),
	        tags:['forgot_password']
	    }
	}, function(error, response){
		responseHandler(error, response, user)
	});
}

exports.request = function(request,cb){
	if(typeof(request.parcel) != 'undefined'){
		var user = request.parcel.user
		// set email language
		setLocale(user.lang)

		var locals = {
	        user: user,
	        title: __('email_request_title'),
	        parcel: request.parcel,
	        link: config.host+'/my/parcels/pending',
        	helper:helper
	    }

	    var text = processTemplate('request/parcel/text',locals)
	    var html = processTemplate('request/parcel/html',locals)
	}else if(typeof(request.trip) != 'undefined'){
		var user = request.trip.user

		// set email language
		setLocale(user.lang)

		var locals = {
	        user: user,
	        trip: request.trip,
	        title: __('email_request_title'),
	        link: config.host+'/my/trips/pending',
        	helper:helper
	      }
		var text = processTemplate('request/trip/text',locals)
	    var html = processTemplate('request/trip/html',locals)
	}else{
		return false
	}

	mandrill('/messages/send', {
	    message: {
	        to: [{email: user.email, name: user.name}],
	        from_email: 'info@wcard.co',
	        from_name: __('wcard'),
	        subject: __('email_request_title'),
	        text: text,
	        html: html,
	        tags:['request']
		    }
	}, function(error, response){
		responseHandler(error, response, user)
	});
}

exports.accepted = function(request,cb){
	// send email to traveller
	accepted_email(request, request.trip.user)

	// send email to parcel owner
	accepted_email(request, request.parcel.user)
}

exports.feedback = function(transaction,cb){
	// send email to traveller
	feedback_email('traveller', transaction)

	// send email to parcel owner
	feedback_email('sender', transaction)
}

var accepted_email = function(request, user){
	setLocale(user.lang)

	var locals = {
		user: user,
		trip: request.trip,
        parcel: request.parcel,
        qr_link: request.request.getQR(),
        title: __('email_accepted_title'),
        helper:helper
      }
	mandrill('/messages/send', {
	    message: {
	        to: [{email: user.email, name: user.name}],
	        from_email: 'info@wcard.co',
	        from_name: __('wcard'),
	        subject:  __('email_accepted_title'),
	        text: processTemplate('accepted/text',locals),
	        html: processTemplate('accepted/html',locals),
	        tags:['request_accepted']
	    }
	}, function(error, response){
		responseHandler(error, response, user)
	});
}

var feedback_email = function(type, transaction){
	if(type === 'traveller'){
		var receiver = transaction.trip.user
		var feedbackUser = transaction.parcel.user
	}else if(type === 'sender'){
		var receiver = transaction.parcel.user
		var feedbackUser = transaction.trip.user
	}else{
		return false
	}

	setLocale(receiver.lang)
	var locals = {
		user: receiver,
		trip: transaction.trip,
        parcel: transaction.parcel,
        feedback_link: config.host+'/feedback/'+feedbackUser.id+'/'+transaction.transaction.id,
        title: __('email_feedback_title'),
        helper:helper
      }
	mandrill('/messages/send', {
	    message: {
	        to: [{email: receiver.email, name: receiver.name}],
	        from_email: 'info@wcard.co',
	        from_name: __('wcard'),
	        subject:  __('email_feedback_title'),
	        text: processTemplate('feedback/'+type+'/text',locals),
	        html: processTemplate('feedback/'+type+'/html',locals),
	        tags:['feedback']
	    }
	}, function(error, response){
		responseHandler(error, response, receiver)
	});
}

/**
 * Mandrill response handler
 * @params {string} error
 * @params {string} response
 */
var responseHandler = function(error, response, user){
    //uh oh, there was an error
    if (error) console.log( JSON.stringify(error) );
    
    //everything's good, lets see what mandrill said
    else {
    	console.log(response);
    	var result = response[0]
    	if(result.reject_reason){
    		user.em_not.bounced = 1
    		user.save()
    	}
    }
}

var processTemplate = function (tplPath, locals) {
	locals.__ = __
	locals.hostname = config.host
	tplPath = __dirname + '/templates/' + tplPath + '.jade'
    var tpl = require('fs').readFileSync(tplPath, 'utf8');
    var html = jade.compile(tpl, { filename: tplPath });
    return html(locals);
}


/**
 * i18n functions
 */
var setLocale = function(language){
	locale = language
}

var __ = function(phrase, params) {
	return i18n.__({phrase: phrase, locale: locale}, params)
}