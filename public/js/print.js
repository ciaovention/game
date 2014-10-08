function printElement(elem) {
		$('body').append('<div id="printSection"></div>');
	    $("#printSection").append(elem);
	    console.log(elem)
	    window.print()
	    
	    setTimeout(function(){$('#printSection').remove();}, 2000);
	}