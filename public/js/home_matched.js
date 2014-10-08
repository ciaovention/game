$(document).ready(function () {
	$('#my-carousel').on('slid.bs.carousel', function () {
	  	var activeTrip = $('.item.active').attr('rel');
		$(".request-trip,.request-parcel").addClass('hidden');
		$("button[rel='"+activeTrip+"']").removeClass('hidden');
		$('.carousel').carousel('pause');
	})
});