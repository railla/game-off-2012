PLAYGROUND_WIDTH = 800;
PLAYGROUND_HEIGHT = 450;
FIGHTER_SIZE = 100;
FRAME_COUNT = 4;
POSITION_Y = 270;
BAR_STEP = 0.3;
BARS_WIDTH = PLAYGROUND_WIDTH / 4;
BARS_HEIGHT = 15;
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

function start_fight(){
    var fighters = {};
    
    function animate_bar(fighter, move){
        console.log(fighter, move, move.hp, BAR_STEP * move.hp);
        $("#hp_" + fighter).css("width", BAR_STEP * move.hp);
        $("#debug_" + fighter).css("background", "white");
        $("#debug_" + fighter).html(move.message);
    }

    function animate(sprite){
        sprite = $(sprite);
        fighter = sprite.data("fighter");
        name = fighter.name;

        move_number = fighter.move;
        move = GF.fighters[name].log[move_number];
        if(typeof move == 'undefined') return;
        var nextState = move.state;
        animate_bar(name, move);
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
        console.log(fighter);
        fighters[fighter] = {
            current_state: IDLE,
            position: UNIT,
            new_position: UNIT,
            adversary: (fighter == "fighter_0") ? "#fighter_1" : "#fighter_0",
            name: fighter,
            move: 0,
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
        }

        $("#fighters").addSprite(fighter,
                                    {posx: UNIT,
                                     posy: POSITION_Y,
                                     height: FIGHTER_SIZE,
                                     width: FIGHTER_SIZE,
                                     animation: fighters[fighter].animations[0].animation,
                                     geometry: $.gQ.GEOMETRY_RECTANGLE,
                                     callback: animate});
        $("#" + fighter).data("fighter", fighters[fighter]);

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
    var hp_fighter_0 = new $.gQ.Animation({imageURL: "./playground/bar.png"});
    var hp_fighter_1 = new $.gQ.Animation({imageURL: "./playground/bar.png"});
    var background = new $.gQ.Animation({imageURL: "./playground/background_0.png"});

    $.playground().addSprite("background",
            {posx: 0, posy: 0,
                height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH,
                animation: background}).addGroup("fighters").end()
        .addGroup("bars", 
            {posx: 0, posy: BARS_HEIGHT,
                height: 2 * BARS_HEIGHT + 4, width: BARS_WIDTH})
        .addSprite("hp_bg_fighter_0",
            {height: BARS_HEIGHT + 2, 
                posx: BARS_WIDTH - 1, posy: 0, 
                width: BARS_WIDTH + 2 })
        .addSprite("hp_bg_fighter_1",
            {height: BARS_HEIGHT + 2, 
                posx: PLAYGROUND_WIDTH - 2 * BARS_WIDTH, posy: 0, 
                width: BARS_WIDTH + 2 })
        .addSprite("hp_fighter_0",
            {height: BARS_HEIGHT, 
                posx: BARS_WIDTH, posy: 0,
                width: BARS_WIDTH,
                animation: hp_fighter_0 })
        .addSprite("hp_fighter_1",
            {height: BARS_HEIGHT, 
                posx: PLAYGROUND_WIDTH - 2 * BARS_WIDTH, posy: 0,
                width: BARS_WIDTH,
                animation: hp_fighter_1 })
        .addSprite("debug_fighter_0",
            {   width: BARS_WIDTH * 2, height: BARS_HEIGHT,
                posx: 0, posy: BARS_HEIGHT })
        .addSprite("debug_fighter_1",
            {   width: BARS_WIDTH * 2, height: BARS_HEIGHT,
                posx: 2 * BARS_WIDTH, posy: BARS_HEIGHT })
	$("#scenegraph").css("background-color","#121423");

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

        $("#hp_fighter_0").css("background-repeat", "repeat");
        $("#hp_fighter_1").css("background-repeat", "repeat");
        $("#hp_fighter_0").css("width", BAR_STEP * GF.fighters.fighter_0.hp);
        $("#hp_fighter_1").css("width", BAR_STEP * GF.fighters.fighter_1.hp);
        $("#hp_bg_fighter_0").css("width", BAR_STEP * GF.fighters.fighter_0.hp);
        $("#hp_bg_fighter_1").css("width", BAR_STEP * GF.fighters.fighter_1.hp);
        $("#hp_bg_fighter_0").css("border", "1px white solid");
        $("#hp_bg_fighter_1").css("border", "1px white solid");
        $("#hp_bg_fighter_0").css("background-color", "#660000");
        $("#hp_bg_fighter_1").css("background-color", "#660000");
        $("#debug_fighter_0").css("background-repeat", "repeat");
        $("#debug_fighter_1").css("background-repeat", "repeat");
    }

	//initialize the start button
	$.playground().startGame(function(){
		$("#loading_screen").fadeOut(2000, function(){$(this).remove()});
    });

    //ready to show fight
    show_fight();
};
