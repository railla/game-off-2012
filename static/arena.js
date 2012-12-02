PLAYGROUND_WIDTH = 800;
PLAYGROUND_HEIGHT = 450;
FRAME_COUNT = 4;
POSITION_Y = 270;
BAR_WIDTH = PLAYGROUND_WIDTH / 4;
BAR_HEIGHT = 15;
UNIT = 100;

//DEBUG = false;
DEBUG = true;
SERVER = "http://githunt.com";
if( DEBUG ) {
    SERVER = "http://127.0.0.1:6000";
}
TIMES_PER_SECOND = 8;

// fighters states
IDLE =          0;
WALK_FORWARD =  1;
WALK_BACKWARD = 2;
KICK =          3;
PUNCH =         4;
BLOCK =         5;
BEATEN =        6;

function get_image(fighter, action) {
    return "/static/" + fighter + "/" + action + "_" + UNIT + "x" + UNIT + "x" + FRAME_COUNT + ".png";
}

function get_hp_step(hp) {
    return ~~(BAR_WIDTH / Math.max(1, hp / BAR_WIDTH));
}

function get_hp_scale(hp) {
    return hp / BAR_WIDTH;
}

function debug_log() {
    if( DEBUG ) console.log(arguments);
}

function start_fight() {
    
    function animate_bar(fighter, move) {
        var tmp = BAR_WIDTH - ~~(move.hp / GF.fighters[fighter].hp_scale);
        var ctx = GF.fighters[fighter].bar_ctx();
        ctx.fillStyle = '#660000';
        var scale = GF.fighters[fighter].hp_scale;
        if(fighter == 'fighter_0') {
            ctx.fillRect(1, 1, tmp - 1, BAR_HEIGHT);
        }
        else {
            ctx.fillRect(BAR_WIDTH - tmp + 1, 1, tmp - 1, BAR_HEIGHT);
        }
    }

    function debug_animate(fighter, move) {
        $('#debug_' + fighter).html(move.message);
    }

    function change_sprite_animation(sprite, animations, state) {
        debug_log(arguments);
        var sprite = $(sprite);
        sprite
            .setAnimation(animations[state].animation)
            .width(animations[state].width)
            .height(animations[state].height)
            .y(sprite.position().top)
            .x(sprite.position().left)
    }

    function change_group_animation (group_sprite, fighter) {
        var fighter_state = fighter.current_state;
        debug_log(fighter_state, PUNCH, group_sprite.children()[0], group_sprite.children()[1]);
        change_sprite_animation(group_sprite.children()[1], fighter.body_animations, fighter_state);
        if( fighter_state >= PUNCH ) {
            change_sprite_animation(group_sprite.children()[0], fighter.effects_animations, fighter_state - PUNCH);
        }
    }

    function animate(sprite) {
        var sprite = $(sprite);
        var group_sprite = $(sprite).parent();
        var name = $(group_sprite).attr('id');
        var fighter = GF.fighters[name];
        var move_number = fighter.move;
        var move = fighter.log[move_number];
        var adversary = GF.fighters[fighter.adversary];

        if(typeof move == 'undefined' || fighter.hp_previous <= 0 || adversary.hp_previous <= 0) {
                $('#playground').fadeOut(6000, function() {
                    $(this).remove();
                    $('#fight_over').append('<p>And the winner is</p><p>' + (fighter.hp < adversary.hp ? adversary.full_name : fighter.full_name) + '!</p>');
                    $.playground().pauseGame();
                });
                return;
        }

        var nextState = move.state;
        // Shouldn't change WALK_* state until reached position
        if( (fighter.current_state == WALK_BACKWARD || fighter.current_state == WALK_FORWARD)
                && group_sprite.x() != fighter.position) {
                    return;
        }

        if(fighter.hp_previous != move.hp) animate_bar(name, move);
        fighter.move ++;

        if(nextState == PUNCH || nextState == KICK) {
            group_sprite.z(20);
        } else if(fighter.current_state == PUNCH || fighter.current_state == KICK) {
            group_sprite.z(0);
        }

        fighter.current_state = nextState;
        fighter.position = move.position * UNIT;
        change_group_animation(group_sprite, fighter);
        debug_animate(name, move);

        fighter.hp_previous = move.hp;
    }


    function create_fighter(fighter) {
        $.extend(GF.fighters[fighter], {
            current_state: IDLE,
            position: UNIT,
            adversary: (fighter == "fighter_0") ? "fighter_1" : "fighter_0",
            name: fighter,
            move: 0,
            hp_scale: get_hp_scale(GF.fighters[fighter].size),
            hp_previous: GF.fighters[fighter].size,
            delta: false,
            body_animations: $.map([ "idle", "walk_forward", "walk_backward", "kick", "punch", "block", "beaten"],
                function(image_name) {
                    return {animation: new $.gQ.Animation({imageURL: get_image(fighter, image_name),
                                        numberOfFrame: FRAME_COUNT,
                                        delta: UNIT,
                                        rate: 180,
                                        type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_CALLBACK}),
                            deltaX: 0,
                            deltaY: 0, 
                            width: UNIT,
                            height: UNIT
                    };
                }),
            effects_animations: $.map([ "fx_punch", "fx_block", "fx_beaten"],
                function(fx_name) {
                    return {animation: new $.gQ.Animation({imageURL: get_image(fighter, fx_name),
                                        numberOfFrame: FRAME_COUNT,
                                        delta: UNIT,
                                        rate: 120,
                                        type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_CALLBACK | $.gQ.ANIMATION_ONCE}),
                            //deltaX: 0,
                            //deltaY: 0, 
                            width: UNIT,
                            height: UNIT
                    };
                })
        });

        $("#fighters").addGroup(fighter,
                            {posy: POSITION_Y,
                             posx: GF.fighters[fighter].log[0].position * UNIT
                             })
                    .addSprite('fx_' + fighter,
                            {animation: GF.fighters[fighter].effects_animations[0].animation,
                             width: UNIT,
                             height: UNIT,
                             posx: (fighter == 'fighter_0') ? UNIT / 4 : - UNIT / 4,
                             callback: function(sprite) { $(sprite).setAnimation(); }
                            })
                    .addSprite('body_' + fighter,
                            {animation: GF.fighters[fighter].body_animations[0].animation,
                             width: UNIT,
                             height: UNIT,
                             callback: animate
                            })
                    .addSprite('hat_' + fighter,
                            {posx: UNIT / 3,
                             posy: - 10, 
                             });
    }

    // the game
    $("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, refreshRate: 25, keyTracker: true});

    //Playground Sprites
    var background = new $.gQ.Animation({imageURL: "/static/playground/background_0.png"});

    $.playground().addSprite("background",
            {posx: 0, posy: 0,
                height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH,
                animation: background}).addGroup("fighters").end()
        .addSprite("debug_fighter_0",
            {   width: BAR_WIDTH * 2, height: BAR_HEIGHT,
                posx: 0, posy: PLAYGROUND_HEIGHT - BAR_HEIGHT })
        .addSprite("debug_fighter_1",
            {   width: BAR_WIDTH * 2, height: BAR_HEIGHT,
                posx: 2 * BAR_WIDTH, posy: PLAYGROUND_HEIGHT - BAR_HEIGHT })

    function show_fight() {
        //Fighters
        for( fighter in GF.fighters ) {
            create_fighter(fighter);
        }

        //register the main callback
        $.playground().registerCallback(function() {

            function move_fighter(fighter) {
                var fighter = $(fighter);
                var name = fighter.attr('id');
                var fighterF = GF.fighters[name];

                //Move
                if(fighterF.current_state == WALK_FORWARD || fighterF.current_state == WALK_BACKWARD) {
                    if( fighterF.delta == false ) {
                        fighterF.delta = (fighterF.position - fighter.x()) / TIMES_PER_SECOND;
                        if( Math.abs(fighterF.delta) > UNIT ) { 
                            fighter.x(fighterF.position);
                            return;
                        }
                    }
                    if( fighterF.current_state == WALK_FORWARD && fighterF.delta < 0
                        || fighterF.current_state == WALK_BACKWARD && fighterF.delta > 0)
                        debug_log('Wrong turn!');
                    fighter.x(fighterF.delta, true);

                    if( fighterF.position == fighter.x() ) {
                        fighterF.delta = false;
                    }
                }
            }
            
            for( fighter in GF.fighters ) move_fighter('#' + fighter);

            if( GF.fighters['fighter_0'].delta || GF.fighters['fighter_1'].delta ) {
                var log = $.map(['fighter_0', 'fighter_1'], function (el) {
                            var fighter = $('#' + el);
                            var name = fighter.attr('id');
                            var fighterF = GF.fighters[name];
                            return [el, fighterF.delta, fighterF.position, fighter.x()];
                });
                debug_log(log);
            }

            var fighter_0 = $('#fighter_0');
            var fighter_0F = GF.fighters['fighter_0'];
            var fighter_1 = $('#fighter_1');
            var fighter_1F = GF.fighters['fighter_1'];

            if(fighter_0F.position == fighter_1F.position) {
                debug_log("Duh!", fighter_0F.position, fighter_1F.position); // TODO
            }
            return false;
        }, 1000 / TIMES_PER_SECOND);

        function draw_bar(fighter, left) {
            var $bar = $('<div><canvas id="canvas_' + fighter + '"></canvas></div>').appendTo('#gQ_scenegraph');
            $bar.css({
                width: BAR_WIDTH + 2,
                height: BAR_HEIGHT * 2,
                left: left,
                top: BAR_HEIGHT,
                position: "absolute",
            });
            var canvas = document.getElementById("canvas_" + fighter);
            if (canvas.getContext) {
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, BAR_WIDTH + 2, BAR_HEIGHT + 2);
                ctx.fillStyle = "#006600";
                var scale = GF.fighters[fighter].hp_scale;
                var BAR_STEP = ~~(BAR_WIDTH / scale);
                var h = 1;
                for(var count = 0; count < scale; count ++) {
                    var x = BAR_STEP * ~~count;
                    var width = BAR_STEP;
                    if(x + width > BAR_WIDTH) {
                        BAR_STEP = BAR_WIDTH - x + h;
                    }
                    ctx.fillRect(x + h, 1, BAR_STEP - h, BAR_HEIGHT);
                }
            }
            GF.fighters[fighter].bar_ctx = function () { 
                return document.getElementById('canvas_' + fighter).getContext('2d'); 
            };
        }
        draw_bar("fighter_0", PLAYGROUND_WIDTH / 2 - 2 * BAR_HEIGHT - BAR_WIDTH);
        draw_bar("fighter_1", PLAYGROUND_WIDTH / 2 + BAR_HEIGHT);
    }
    
    $.playground().startGame(function() {
	    $("#loading_screen").fadeOut(6000, function() {
            $(this).remove();
            //ready to show fight
            show_fight();
        });
    });

};
