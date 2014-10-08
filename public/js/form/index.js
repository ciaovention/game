$(document).ready(function () {
    $('form').submit(function(e){e.preventDefault()})
    .validate({
        ignore: [],
        messages:{
            from:{
                required: 'City not found.'
            },
            to:{
                required: 'City not found.'
            }
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            var name = $(element).attr('name').split('_');
            if(typeof name[1] != 'undefined'){
                $('input[name="'+name[1]+'"]').siblings('.help-block').remove();
            }
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
            form.submit();
        }
    });

    $('button=[type="submit"]').click(function(e){
        var type = $(this).data('type');
        var url = 'matched/'+type;
        $('form').attr("action", url);
    });
});