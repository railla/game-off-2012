PLAYGROUND_WIDTH = 800;
PLAYGROUND_HEIGHT = 450;
FIGHTER_SIZE = 100;
FRAME_COUNT = 4;
POSITION_Y = 270;
BAR_WIDTH = PLAYGROUND_WIDTH / 4;
BAR_HEIGHT = 15;
UNIT = 100;
DEBUG_SERVER = "http://127.0.0.1:5000";
REFRESH_RATE = 25;

// fighters states
IDLE =          0;
WALK_FORWARD =  1;
WALK_BACKWARD = 2;
PUNCH =         3;
KICK =          4;
BLOCK =         5;
BEATEN =        6;

function get_image(fighter, action){
    return "./" + fighter + "/" + action + "_" + FIGHTER_SIZE + "x" + FIGHTER_SIZE + "x" + FRAME_COUNT + ".png";
}

function get_hp_step(hp) {
    return ~~(BAR_WIDTH / Math.max(1, hp / BAR_WIDTH));
}

function get_hp_scale(hp) {
    return hp / BAR_WIDTH;
}

function start_fight(){
    
    function animate_bar(fighter, move){
        var tmp = BAR_WIDTH - ~~(move.hp / GF.fighters[fighter].hp_scale);
        console.log(fighter, GF.fighters[fighter].hp_scale, move.hp, tmp);
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

    function debug_animate(fighter, move){
        $('#debug_' + fighter).css('background', 'white');
        $('#debug_' + fighter).html(move.message);
    }

    function animate(sprite){
        sprite = $(sprite).parent();
        fighter = sprite.data("fighter");
        name = fighter.name;
        move_number = fighter.move;
        fighter_ = GF.fighters[name];
        move = fighter_.log[move_number];

        if(typeof move == 'undefined' || (fighter_.hp_previous <=0 && move.hp <= 0)) {
                $('#playground').fadeOut(6000, function(){
                    $(this).remove();
                    $('#fight_over').append('<p>And the winner is</p><p>' + fighter_.full_name + '!</p>');
                    $.playground().pauseGame();
                });
                return;
        }
        var nextState = move.state;
        if(fighter_.hp_previous != move.hp) animate_bar(name, move);
        debug_animate(name, move);
        fighter_.hp_previous = move.hp;
        fighter.move ++;

        changeAnimation(sprite, fighter.animations, nextState, fighter.current_state);

        if(nextState == PUNCH || nextState == KICK){
            sprite.z(20);
        } else if(fighter.current_state == PUNCH || fighter.current_state == KICK){
            sprite.z(0);
        }

        fighter.current_state = nextState;
        fighter.new_position = move.position * UNIT;
        fighter.position = move.position * UNIT;
    }

    function create_fighter(fighter){
        $.extend(GF.fighters[fighter], {
            current_state: IDLE,
            position: UNIT,
            new_position: UNIT,
            adversary: (fighter == "fighter_0") ? "#fighter_1" : "#fighter_0",
            name: fighter,
            move: 0,
            hp_scale: get_hp_scale(GF.fighters[fighter].size),
            hp_previous: GF.fighters[fighter].size,
            animations: $.map([ {imageURL: get_image(fighter, "idle"),
                                numberOfFrame: FRAME_COUNT,
                                delta: FIGHTER_SIZE, rate: 240,
                                type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_CALLBACK},
                                {imageURL: get_image(fighter, "walk_forward"),
                                numberOfFrame: FRAME_COUNT,
                                delta: FIGHTER_SIZE, rate: 240,
                                type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_CALLBACK},
                                {imageURL: get_image(fighter, "walk_backward"),
                                numberOfFrame: FRAME_COUNT,
                                delta: FIGHTER_SIZE, rate: 240,
                                type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_CALLBACK},
                                {imageURL: get_image(fighter, "punch"),
                                numberOfFrame: FRAME_COUNT,
                                delta: FIGHTER_SIZE, rate: 240,
                                type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_CALLBACK},
                                {imageURL: get_image(fighter, "kick"),
                                numberOfFrame: FRAME_COUNT,
                                delta: FIGHTER_SIZE, rate: 240,
                                type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_CALLBACK},
                                {imageURL: get_image(fighter, "block"),
                                numberOfFrame: FRAME_COUNT,
                                delta: FIGHTER_SIZE, rate: 480,
                                type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_CALLBACK},
                                {imageURL: get_image(fighter, "hit"),
                                numberOfFrame: FRAME_COUNT, rate: 720,
                                type: $.gQ.ANIMATION_CALLBACK}],
                function(params){ 
                    return {animation: new $.gQ.Animation(params), deltaX: 0, deltaY: 0, 
                        width: FIGHTER_SIZE, height: FIGHTER_SIZE};})
        });

        $("#fighters").addGroup(fighter,
                            {posx: UNIT,
                             posy: POSITION_Y,
                             height: FIGHTER_SIZE,
                             width: FIGHTER_SIZE})
                    .addSprite('body_' + fighter,
                            {animation: GF.fighters[fighter].animations[0].animation,
                             geometry: $.gQ.GEOMETRY_RECTANGLE,
                             callback: animate})
                    .addSprite('hat_' + fighter,
                            {posx: UNIT / 3,
                             posy: - 10, 
                             animation: {imageURL: get_image(fighter, "hat"),
                                numberOfFrame: FRAME_COUNT, rate: 720,
                                type: $.gQ.ANIMATION_CALLBACK}});
        $("#" + fighter).data("fighter", GF.fighters[fighter]);

    }

    //replace with new
    var changeAnimation = function(sprite, animationArry, newAnimation , oldAnimation){
        sprite
            .setAnimation(animationArry[newAnimation].animation)
            .width(animationArry[newAnimation].width)
            .height(animationArry[newAnimation].height)
            .y(sprite.position().top)
            .x(sprite.position().left)
    };

    // the game
    $("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, refreshRate: 10, keyTracker: true});

    //Playground Sprites
    var background = new $.gQ.Animation({imageURL: "./playground/background_0.png"});

    $.playground().addSprite("background",
            {posx: 0, posy: 0,
                height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH,
                animation: background}).addGroup("fighters").end()
        .addSprite("debug_fighter_0",
            {   width: BAR_WIDTH * 2, height: BAR_HEIGHT,
                posx: 0, posy: 3 * BAR_HEIGHT })
        .addSprite("debug_fighter_1",
            {   width: BAR_WIDTH * 2, height: BAR_HEIGHT,
                posx: 2 * BAR_WIDTH, posy: 3 * BAR_HEIGHT })

    function show_fight(){
        //Fighters
        for( fighter in GF.fighters ){
            create_fighter(fighter);
        }

        //register the main callback
        $.playground().registerCallback(function(){
            var fighter_0 = $("#fighter_0");
            var fighter_0F = fighter_0.data("fighter");

            var fighter_1 = $("#fighter_1");
            var fighter_1F = fighter_1.data("fighter");

            //Move
            if(fighter_0F.current_state == WALK_FORWARD || fighter_0F.current_state == WALK_BACKWARD){
                fighter_0.x(fighter_0F.position);
            }
            if(fighter_1F.current_state == WALK_FORWARD || fighter_1F.current_state == WALK_BACKWARD){
                fighter_1.x(fighter_1F.position);
            }

            if(fighter_0F.position == fighter_1F.position) {
                console.log("Duh!", fighter_0F.position, fighter_1F.position); // TODO
            }
            return false;
        }, 1000); // TODO bring back animations

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
            if (canvas.getContext){
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
    
	//initialize the start button
    $.playground().startGame(function(){
		$("#loading_screen").fadeOut(2000, function(){$(this).remove()});
    });

    //ready to show fight
    show_fight();
};
