$(document).ready(function () {
	$(".f_elem_city").autocomplete({
		source: function (request, response) {
		 $.getJSON(
			"/a/cities/search?term="+request.term,
			function (data) {
				if(data[0] != ""){
					response(data);
				}
			}
		 );
		},
		minLength: 3,
		select: function (event, ui) {
		 var selectedObj = ui.item;
		 $(this).val(selectedObj.value);
		 getcitydetails(selectedObj.value,$(this).attr('name'));
		 return false;
		},
		open: function () {
		 $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
		},
		close: function () {
		 $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
		}
	});
	$(".f_elem_city").autocomplete("option", "delay", 100);

	function getcitydetails(fqcn,type) {
 
		if (typeof fqcn == "undefined") 
			fqcn = $("#f_elem_city").val();
	 
		cityfqcn = fqcn;
	 
		if (cityfqcn) {
		 	$.getJSON(
				"/a/cities/details?fqcn="+cityfqcn,
			 function (data) {
			 	if(type == '_from'){
			 		$('input[name="from"]').val(data.geobytescityid);
			 		$('select[name="offer[currency]"]').val(data.geobytescurrencycode);
			 	}
			 	else{
			 		$('input[name="to"]').val(data.geobytescityid);
			 	}	
			 }
		 );
		}
	}

	// Get current city and autocomplete search
	if(typeof geoip_city == 'function'){
		$('input[name="_from"]').val(geoip_city());
		setTimeout(function() {
		    $('input[name="_from"]').autocomplete("search");
		    setTimeout(function() {
			    if($('#ui-id-1').html().length == 0){
			    	$('input[name="_from"]').val('');
			    }
			},500);
		}, 1000);
	}
});
