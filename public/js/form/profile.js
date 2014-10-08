$(document).ready(function () {
    if(!isAuthenticated){
        var emailObject = {
                required: true,
                email: true,
                remote: {
                    url: "/a/user/emailExist",
                    type: "post",
                    async: false,
                    data: {
                        email: function() {
                            return $( "#email" ).val();
                        }
                    }
                }
            };
        $('#email').focusout(function(){
            getShortUrl($(this).val());
        });
    }else{
        var emailObject = null;
    }

    $.validator.addMethod("urlCheck", function (value, element) {
        //if(value.length == 0)
        return (value.length == 0) || /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value.toLowerCase());
    }, 'URL is invalid.');


    $('form').validate({
            rules: {
                name: {
                    minlength: 2,
                    maxlength: 20,
                    required: true
                },
                email: emailObject,
                password: {
                    minlength: 6,
                    maxlength: 50,
                    required: true,
                },
                website: {
                    urlCheck: true
                }
            },
            messages: {
                email:{
                    remote: "Email already exist"
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorElement: 'span',
            errorClass: 'help-block',
            errorPlacement: function(error, element) {
                if(element.parent('.input-group').length) {
                    error.insertAfter(element.parent());
                } else {
                    error.insertAfter(element);
                }
            },
            submitHandler: function(form) {
              $('.overlay-spinner').show();
              form.submit();
            }
        });
    
    $('.preview-container').click(function(){
        $('#avatar-image').click();
    });

    $('.current-location').click(function(){
        getLocation();
    });

    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {

          // Only process image files.
          if (!f.type.match('image.*')) {
            continue;
          }

          var reader = new FileReader();

          // Closure to capture the file information.
          reader.onload = (function(theFile) {
            return function(e) {
              // Render thumbnail.
              $('#avatar-preview').attr('src',e.target.result);
            };
          })(f);

          // Read in the image file as a data URL.
          reader.readAsDataURL(f);
        }
    }

    $('#avatar-image').on('change', function(e){
        handleFileSelect(e);
    });

    // Set user city, province and country
    function getLocation(){
        $('.current-location').html('定位中...');
        $.getScript('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js', function(){
            $('.current-location').html('');
            var items = ['country','province','city'];
            items.forEach(function(item){
              $('#'+item).val(remote_ip_info[item]);
              $('.current-location').append(remote_ip_info[item] + ' ');
            });
        });
    }

    if(!$('#country').val().length || !$('#province').val().length || !$('#city').val().length )
        getLocation();
    
});