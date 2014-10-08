$(document).ready(function () {

	if (document.createElement("input").placeholder == undefined) {
	    // Placeholder is not supported
	    $('.hide-label').removeClass('hide');
	}else{
		$('.add-offset').addClass($('.add-offset').data('offset'));
	}

	$('.table-dropdown,.modal').on('click',function(e){
		return false;
	});

	/*
	if($('.main-messages').html().trim() != ""){
		$('.carousel').hide();
	}
	*/

	$('.close').on('click', function(){
		$('.modal-backdrop').remove();
	});

	// Disable back button on these page
	var noBackRoutes = ["/logout","/login","/signup"];
	var noBack = function(){
	  var exist = noBackRoutes.indexOf(window.location.pathname);
	  if(exist >= 0)
	    window.history.forward(1);
	}();


	$('.close-msg').click(function(){
		$('.sbg').hide();
	});

	$('.spinner').click(function(){
		$('.overlay-spinner').show();
	});

	if(typeof hasShorturl !== 'undefined' && !hasShorturl){
		getShortUrl();
	}
	
});

function getShortUrl(email){
	var username = (email || '').split('@')[0];
	$.get('/a/user/shorturl',{username: username}, function(data){
		if(data !== false){
			$('#shorturl').val(data);
		}
	});
}

function showMessage(message, type) {
	var html = '<div class="fade in alert alert-'+type+'">' +
        		'<button type="button" data-dismiss="alert" class="close">×</button>' +
          			'<ul><li>'+message+'</li></ul></div>';
    $('.main-messages').html(html);
}