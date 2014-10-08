$(document).ready(function () {
	$('#stripe-connect').on('click',function(){
		connectToStripe();
	});

	function connectToStripe(){
        authWindow = window.open("/a/stripe/authorize", "Connect", "toolbar=0,status=0,resizable=1,width=976,height=600");
        authInterval = window.setInterval(
            function()
            {
                if (authWindow.closed) {
                    window.clearInterval(authInterval);
                    isConnected();
                }
            }, 1000);
    }

    function isConnected(){
        $.get("/a/stripe/connected",function(response){
                if (response.success) {
                    stripeConnected = true;
                    location.reload();
                }
            },"json"
        );
    }
});