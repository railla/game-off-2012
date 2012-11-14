var GF = {fighters: {}};
$(document).ready(function() {
    var query = function(url, callback) {
        $.ajax('https://api.github.com' + url, {
            dataType: 'jsonp',
            success: function(data) {
                return callback(data.data);
            }
        });
    };

    $('.f-selector').bind('blur', function(event) {
        var input = $(this).val();
        if (!input.match(/^\w+\/\w+$/)) {
            $(this).addClass('error');
            return false;
        } else {
            $(this).removeClass('error');
        }
        var that = this;
        query('/repos/' + input, function(data) {
            if (data.message) {
                $(that).addClass('error');
                GF.fighters[event.target.id] = undefined;
                $('#fight').attr('disabled', 'disabled');
            } else {
                $(that).removeClass('error');
                GF.fighters[event.target.id] = data;
                if (GF.fighters.f1 && GF.fighters.f2) {
                    if (GF.fighters.f1.full_name == GF.fighters.f2.full_name) {
                        $('#fight').attr('disabled', 'disabled');
                        return false;
                    }
                    $('#fight').removeAttr('disabled');
                }
            }
        });
    });
    $('#fight').bind('click', function() {
        $(this).attr('disabled', 'disabled');
        alert('let the mortal combat begin');
        $.ajax({
            type: 'POST',
            url: DEBUG_SERVER + "/fight",
            data: JSON.stringify(GF),
            success: function(){},
            contentType: "application/json; charset=UTF-8"
        });
    });
});
