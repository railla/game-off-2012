PLAYGROUND_WIDTH = 800;
PLAYGROUND_HEIGHT = 450;
FIGHTER_SIZE = 100;
FRAME_COUNT = 4;
POSITION_Y = 270;
BAR_STEP = 5;
BARS_WIDTH = 1000;
UNIT = 100;
DEBUG_SERVER = "http://127.0.0.1:5000/";
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

$(function(){
    var scenario;
    var fighters = {};

    $.getJSON(DEBUG_SERVER + "/start",
            function(data) {
                scenario = data;
                show_fight();
            }
        );

    function animate_bar(fighter, move_number){
        $("#hp_" + fighter).css("width", BAR_STEP * scenario.log[fighter][move_number].hp);
        $("#debug_" + fighter).css("background", "white");
        $("#debug_" + fighter).html(scenario.log[fighter][move_number].message);
    }

    function animate(sprite){
        sprite = $(sprite);
        fighter = sprite.data("fighter");
        name = fighter.name;

        move_number = fighter.move;
        move = scenario.log[name][move_number];
        if(typeof move == 'undefined') return;
        var nextState = move.state;
        animate_bar(name, move_number);
        fighter.move ++;

        changeAnimation(sprite, fighter.animations, nextState, fighter.current_state);

        if(nextState == PUNCH || nextState == KICK){
            sprite.z(20);
        } else if(fighter.current_state == PUNCH || fighter.current_state == KICK){
            sprite.z(0);
        }

        fighter.current_state = nextState;
        console.log(move.position);
        fighter.new_position = move.position * UNIT;
        fighter.position = move.position * UNIT;
    }

    function create_fighter(fighter){
        fighters[fighter] = {
            current_state: IDLE,
            position: scenario.fighters[fighter].position * UNIT,
            new_position: scenario.fighters[fighter].position * UNIT,
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
                                    {posx: scenario.fighters[fighter].position * UNIT,
                                     posy: POSITION_Y,
                                     height: FIGHTER_SIZE,
                                     width: FIGHTER_SIZE,
                                     animation: fighters[fighter].animations[0].animation,
                                     geometry: $.gQ.GEOMETRY_RECTANGLE,
                                     callback: animate});
        $("#" + fighter).data("fighter", fighters[fighter]);

    }

    /*replace with new*/
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
                height: 450, width: 800,
                animation: background}).addGroup("fighters").end()
        .addGroup("bars", 
            {posx:0, posy: 5,
                height: 35, width: BARS_WIDTH})
        .addSprite("hp_fighter_0",
            {height: 15, posx:50, posy: 0, 
                width: BARS_WIDTH / 2,
                animation: hp_fighter_0 })
        .addSprite("hp_fighter_1",
            {height: 15, posx:350, posy: 0, 
                width: BARS_WIDTH / 2,
                animation: hp_fighter_1 })
        .addSprite("debug_fighter_0",
            {height: 15, posx:50, posy: 15, 
                width: BARS_WIDTH / 2,
                animation: hp_fighter_0 })
        .addSprite("debug_fighter_1",
            {height: 15, posx:350, posy: 15, 
                width: BARS_WIDTH / 2,
                animation: hp_fighter_1 })
	$("#scenegraph").css("background-color","#121423");

    function show_fight(){
        //Fighters
        create_fighter("fighter_0");
        create_fighter("fighter_1");
        fighter_0 = fighters.fighter_0;
        fighter_1 = fighters.fighter_1;

        //register the main callback
        $.playground().registerCallback(function(){
            var fighter_1 = $("#fighter_1");
            var fighter_1F = fighter_1.data("fighter");

            var fighter_0 = $("#fighter_0");
            var fighter_0F = fighter_0.data("fighter");

            //Move
            if(fighter_0F.current_state == WALK_FORWARD || fighter_0F.current_state == WALK_BACKWARD){
                fighter_0.x(fighter_0F.position);
            }
            if(fighter_1F.current_state == WALK_FORWARD || fighter_1F.current_state == WALK_BACKWARD){
                fighter_1.x(fighter_1F.position);
            }

            if(fighter_0F.position == fighter_1F.position) {
                console.log("Duh!", fighter_0F.position, fighter_1F.position);
                //return false;
            }
            return false;
        }, 1000);

        $("#hp_fighter_0").css("background-repeat", "repeat");
        $("#hp_fighter_1").css("background-repeat", "repeat");
        $("#debug_fighter_0").css("background-repeat", "repeat");
        $("#debug_fighter_1").css("background-repeat", "repeat");
        $("#hp_fighter_0").css("width", BAR_STEP * scenario.fighters.fighter_0.hp);
        $("#hp_fighter_1").css("width", BAR_STEP * scenario.fighters.fighter_1.hp);
    }

	//initialize the start button
	$.playground().startGame();
});

