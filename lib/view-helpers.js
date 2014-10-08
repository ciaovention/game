
/**
 * Module dependencies.
 */

var url = require('url')
  , qs = require('querystring')
  , i18n = require('i18n')
  , imagerConfig = require('../config/imager')

/**
 * Helpers method
 *
 * @param {String} name 
 * @return {Function}
 * @api public
 */

function helpers (name) {
  return function (req, res, next) {
    res.locals.appName = name || 'App'
    res.locals.title = name || 'App'
    res.locals.req = req
    res.locals.isActive = function (link) {
      return req.url.indexOf(link) !== -1 ? 'active' : ''
    }

    // Remove html tags for all POST fields
    if(!isEmpty(req.body)) cleanField(req)
    
    // Add script strip from the param to prevent XSS attack
    req.paramSafe = function(name, defaultValue){
      return stripTag(req.param(name, defaultValue))
    };

    //req.locals.stripScript = stripScript
    res.locals.formatDate = formatDate
    res.locals.formatDatetime = formatDatetime
    res.locals.stripTag = stripTag
    res.locals.createPagination = createPagination(req)
    res.locals.getImage = getImage

    if (typeof req.flash !== 'undefined') {
      res.locals.info = req.flash('info')
      res.locals.errors = req.flash('error')
      res.locals.success = req.flash('success')
      res.locals.warning = req.flash('warning')
    }

    /**
     * Render mobile views
     *
     * If the request is coming from a mobile/tablet device, it will check if
     * there is a .mobile.ext file and it that exists it tries to render it.
     *
     * Refer https://github.com/madhums/nodejs-express-mongoose-demo/issues/39
     * For the implementation refer the above app
     */

    // For backward compatibility check if `app` param has been passed
    var ua = req.header('user-agent')
    var fs = require('fs')

    res._render = res.render
    req.isMobile = /mobile|ipad|nexus/i.test(ua)

    res.render = function (template, locals, cb) {

      // test if locale, render template with locale
      if(typeof template === 'object'){
        var template_file = template.base + '/' + template.locale
        var view = template_file + '.' + req.app.get('view engine')
        var file = req.app.get('views') + '/' + view
        template = fs.existsSync(file) ? template_file : template.base + '/' + 'en'
      }

      var view = template + '.mobile.' + req.app.get('view engine')
      var file = req.app.get('views') + '/' + view

      // render mobile template
      if (/mobile/i.test(ua) && fs.existsSync(file)) {
        res._render(view, locals, cb)
      } else {
        res._render(template, locals, cb)
      }
    }

    next()
  }
}

module.exports = helpers

/**
 * Pagination helper
 *
 * @param {Number} pages
 * @param {Number} page
 * @return {String}
 * @api private
 */

function createPagination (req) {
  return function createPagination (pages, page, previous, next) {
    var params = qs.parse(url.parse(req.url).query)
    var str = ''

    params.page = 1
    var prev_clas = page == 1 ? "disabled" : ""
    var next_clas = page == pages ? "disabled" : ""
    var prev_href = prev_clas == "" ? '?page=' + (page - 1) : '#'
    var next_href = next_clas == "" ? '?page=' + (page + 1) : '#'

    str += '<li class="'+prev_clas+'"><a href="'+ prev_href +'">' + previous + '</a></li>'
    str += '<span>&nbsp;<span>'
    str += '<li class="'+next_clas+'"><a href="'+ next_href +'">' + next + '</a></li>'

    return str
  }
}

/**
 * Format date helper
 *
 * @param {Date} date
 * @return {String}
 * @api private
 */

function formatDate (date) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  d = new Date(date)
  return [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('-');
}

/**
 * Format date time helper
 *
 * @param {Date} date
 * @return {String}
 * @api private
 */

function formatDatetime (date) {
  date = new Date(date)
  var hour = date.getHours();
  var minutes = date.getMinutes() < 10
    ? '0' + date.getMinutes().toString()
    : date.getMinutes();

  return formatDate(date) + ' ' + hour + ':' + minutes;
}

/**
 * Strip html tags
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function stripTag (html) {
    html = html || '';
    return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '').replace(/\s+/g, ' ').trim()
}

/**
 * Strip html tags of an object recursively
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function stripEachRecursive(obj)
{
    for (var k in obj)
    {
        if (typeof obj[k] == "object" && obj[k] !== null)
            stripEachRecursive(obj[k]);
        else{
          obj[k] = obj[k] || '';
          obj[k] = stripTag(obj[k])
        }
    }
}

/**
 * Clean post or get fields of request
 *
 * @param {Object} req
 * @return {Object}
 * @api private
 */

function cleanField (req) {
  stripEachRecursive(req.body)
}

/**
 * Check if value is empty
 *
 * @param {Mix} req
 * @return {Boolean}
 * @api private
 */

function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;
 
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;
 
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
 
    return true;
}

function getImage(file){
  return imagerConfig.storage.S3.cdn+ '/' + file
}