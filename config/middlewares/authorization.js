
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if(req.wechat && req.route.path == '/dashboard/profile')
      return next()
  
  if (req.isAuthenticated()) {
    if(req.user.lang != res.getLocale()){
      req.user.lang = res.getLocale()
      req.user.save()
    }

    return next()
  }
  if (req.method == 'GET') req.session.returnTo = req.originalUrl

  // If request is from email verification, redirect to login page
  if(req.params.token && req.params.userId) return res.redirect('/login')
    
  res.redirect('/signup')
}

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', res.__('you_are_not_authorized'))
      return res.redirect('/users/' + req.profile.id)
    }
    next()
  },

  emailConfirmed: function (req, res, next) {
    // Can post trip or kago info if email is wrong or not set
    if(typeof req.user.email == 'undefined'){
      req.flash('error', [res.__('update_your_email')])
      if(req.method == 'POST')
        return res.redirect('back')
    }

    if (req.user.em_not && req.user.em_not.bounced){
      req.flash('error', [res.__('confirm_email_to_continue',{email: req.user.email})])
      if(req.method == 'POST')
        return res.redirect('back')
    }
    
    next()
  },

  // Prevent back button
  backIfAuthorized : function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('back')
    }
    next()
  },

  stipeConnected: function (req, res, next){
    if(req.route.path == '/trip/new'){
      if(!req.user.stripe.accessToken){
        req.flash('info', [res.__('cash_only_mode')])
        req.flash('info', [res.__('stripe_connected_warning_text')])
      }
    }
    if(req.route.path == '/parcel/new'){
      if(!req.user.stripe.customerId){
        req.flash('info', [res.__('cash_only_mode')])
        req.flash('info', [res.__('stripe_collect_warning_text')])
      }
    }
    next()
  }

}

/*
 *  Parcel authorization routing middleware
 */

exports.parcel = {
  hasAuthorization: function (req, res, next) {
    if (req.parcel.user.id != req.user.id) {
      req.flash('info', res.__('you_are_not_authorized'))
      return res.redirect('/my/parcels')
    }
    next()
  }
}

/*
 *  Trip authorization routing middleware
 */

exports.trip = {
  hasAuthorization: function (req, res, next) {
    if (req.trip.user.id != req.user.id) {
      req.flash('info', res.__('you_are_not_authorized'))
      return res.redirect('/my/trips')
    }
    next()
  }
}
