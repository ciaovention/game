$(document).ready(function () {
    var validateRecaptcha = $('#recaptcha').html() ? false : true;
    
    $('#signup').validate({
        rules: {
            name: {
                minlength: 2,
                maxlength: 20,
                required: true
            },
            email: {
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
            },
            username: {
                minlength: 3,
                maxlength: 18,
                required: true,
                remote: {
                    url: "/a/user/usernameExist",
                    type: "post",
                    data: {
                        username: function() {
                            return $( "#username" ).val();
                        }
                    }
                }
            },
            password: {
                minlength: 6,
                maxlength: 50,
                required: true,
            }
        },
        messages: {
            email:{
                remote: "Email already exist"
            },
            username: {
                remote: "Username already taken"
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
            if(!validateRecaptcha){
                $('#signup').hide();
                $('#recaptcha').show();
            }else{
                form.submit();
            }
        }
    });

    $('#recaptcha').submit(function(e){
        e.preventDefault();
        $('.help-block').remove()

        var recaptcha_challenge_field = $('input=[name="recaptcha_challenge_field"]').val();
        var recaptcha_response_field = $('input=[name="recaptcha_response_field"]').val();
        var csrf = $('input=[name="_csrf"]').val();

        $.post('/a/recaptcha/validate',{recaptcha_challenge_field: recaptcha_challenge_field, recaptcha_response_field:recaptcha_response_field, _csrf: csrf},function(data){
            if(data.success == true){
                validateRecaptcha = true;
                $("#signup").submit();
            }else{
                var html = '<span for="recaptcha_response_field" class="help-block">Captcha entry did not match</span>';
                $('#recaptcha').children('.form-group').addClass('has-error').append(html);
                Recaptcha.reload();
            }
        },'json');

    });
});