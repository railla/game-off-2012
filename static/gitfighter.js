var GF = {fighters: {}};

var stub_fighters = {"fighters":{"fighter_0":{"open_issues":2,"pushed_at":"2012-11-14T17:27:48Z","ssh_url":"git@github.com:some_login/some_name.git","has_downloads":true,"forks_count":60,"forks":60,"created_at":"2011-12-18T15:22:51Z","owner":{"login":"some_login","avatar_url":"https://secure.gravatar.com/avatar/9ba739c8f3288e256b13553e4d257b5e?d', u'https://example.com/example.png","gravatar_id":"blah","id":1,"url":"https://api.github.com/users/some_login"},"full_name":"some_login/some_name","network_count":60,"mirror_url":null,"homepage":"","organization":{"login":"some_login","avatar_url":"https://secure.gravatar.com/avatar/some_avatar","gravatar_id":"blah","id":1,"url":"https://api.github.com/users/some_login"},"watchers":823,"has_wiki":true,"open_issues_count":2,"updated_at":"2012-11-14T17:54:48Z","clone_url":"https://github.com/some_login/some_name.git","svn_url":"https://github.com/some_login/some_name","description":"some_name is a","master_branch":"master","git_url":"git://github.com/some_login/some_name.git","size":872,"has_issues":true,"fork":false,"language":"ActionScript","name":"some_name","watchers_count":823,"html_url":"https://github.com/some_login/some_name","private":false,"id":2,"url":"https://api.github.com/repos/some_login/some_name"},"fighter_1":{"open_issues":1,"pushed_at":"2012-11-14T13:05:35Z","ssh_url":"git@github.com:some_other_project/other_name.git","has_downloads":true,"forks_count":2,"forks":2,"created_at":"2012-11-11T19:02:54Z","owner":{"login":"some_other_project","avatar_url":"https://secure.gravatar.com/avatar/another_avatar","gravatar_id":"blah","id":308,"url":"https://api.github.com/users/some_other_project"},"full_name":"some_other_project/other_name","network_count":2,"mirror_url":null,"homepage":null,"watchers":34,"has_wiki":true,"open_issues_count":1,"updated_at":"2012-11-14T14:52:10Z","clone_url":"https://github.com/some_other_project/other_name.git","svn_url":"https://github.com/some_other_project/other_name","description":"some description","master_branch":"master","git_url":"git://github.com/some_other_project/other_name.git","size":140,"has_issues":true,"fork":false,"language":"Python","name":"other_name","watchers_count":34,"html_url":"https://github.com/some_other_project/other_name","private":false,"id":3,"url":"https://api.github.com/repos/some_other_project/other_name"}}};

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
                //$('#fight').attr('disabled', 'disabled');
            } else {
                $(that).removeClass('error');
                GF.fighters[event.target.id] = data;
                if (GF.fighters.fighter_0 && GF.fighters.fighter_1) {
                    if (GF.fighters.fighter_0.full_name == GF.fighters.fighter_1.full_name) {
                        //$('#fight').attr('disabled', 'disabled');
                        return false;
                    }
                    $('#fight').removeAttr('disabled');
                }
            }
        });
        });
    $('#fight').bind('click', function() {
        //$(this).attr('disabled', 'disabled');
        GF = stub_fighters; // TODO replace stub
        $('#playground_overlay').hide();
        for(fighter_ in GF.fighters) {
            content = '';
            var fighter = GF.fighters[fighter_];
            $.each(["full_name", 
                    "language",
                    "size", 
                    "watchers", 
                    "forks", 
                    "open_issues", 
                    "description"],
                function(i, property) {
                    var value = fighter[property];
                    console.log(property, value, !value, value == null);
                    content += '<p> ' + property + ": " + value + '</p>';
                });
            console.log("#stats_" + fighter_);
            $(content).appendTo("#stats_" + fighter_);
        }
                
        $.ajax({
        type: 'POST',
        url: DEBUG_SERVER + "/fight",
        data: JSON.stringify(GF),
        success: function(data){
            GF.fighters.fighter_0.log = data.log.fighter_0;
            GF.fighters.fighter_1.log = data.log.fighter_1;
            console.log(data, GF.fighters.fighter_0.log, GF.fighters.fighter_1.log);
            start_fight();
            },
        contentType: "application/json; charset=UTF-8"
        });
    });
});
