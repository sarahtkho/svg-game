// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

//
// Check if the point is inside a platform
//
function isPlatform(x, y, s) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var px = parseFloat(node.getAttribute("x"));
        var py = parseFloat(node.getAttribute("y"));
        var pw = parseFloat(node.getAttribute("width"));
        var ph = parseFloat(node.getAttribute("height"));

        if (intersect(new Point(px, py), new Size(pw, ph), new Point(x,y), new Size(s, s)))
            return true;
    }
    return false;
}

//
//  Check if the object is inside the screen
//
function isInArea(x, y, size) {
    if (x < 0 || y < 0 || x + size.w > SCREEN_SIZE.w || y + size.h > SCREEN_SIZE.h) return false;
    return true;
}


//
// To play sound
//
function playsnd(id) {
    if (isASV) {
        var snd = document.getElementById(id + "_asv")[0];
        snd.endElement();
        snd.beginElement();
        // console.log("asv");
    }
    if (isFF) {
        var snd = document.getElementById(id);
        snd.currentTime = 0;
        snd.play();
        // console.log("ff");
    }
}


function ShootMonster(x, y, dx, dy) {    
    this.node = document.getElementById("shootmonster");
    this.node.setAttribute("visibility", "visible");
    this.curr = new Point(x,y);
    this.ori = new Point(x,y);
    this.dest = new Point(dx, dy);
    if (x < dx) this.rightdir = true;
    else this.rightdir = false;
    rightshootdir = this.rightdir;
}

function monstershoot() {
    if(document.getElementById("monbulls").childNodes.length == 0) {
        if (shootMonster == null) return; 
        rightshootdir = shootMonster.rightdir;
        var monbull = document.createElementNS("http://www.w3.org/2000/svg", "use");
        monbull.setAttribute("x", parseInt(shootMonster.curr.x) + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        monbull.setAttribute("y", parseInt(shootMonster.curr.y) + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
        monbull.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monbull");
        document.getElementById("monbulls").appendChild(monbull);
        // console.log("shoot");
    }
    else if (parseInt(monbulls.childNodes.item(0).getAttribute("x")) <= 0 || parseInt(monbulls.childNodes.item(0).getAttribute("x")) > SCREEN_SIZE.w) {
        document.getElementById("monbulls").removeChild(monbulls.childNodes.item(0));
        // console.log("out of screen");
    }
    else {
        // console.log(monbulls.childNodes.item(0).getAttribute("x"));
        if (rightshootdir)
            monbulls.childNodes.item(0).setAttribute("x", parseInt(monbulls.childNodes.item(0).getAttribute("x"))+BULLET_SPEED/3);
        else 
            monbulls.childNodes.item(0).setAttribute("x", parseInt(monbulls.childNodes.item(0).getAttribute("x"))-BULLET_SPEED/3);
    }
}

function monsterMove() {
    if (shootMonster == null) return;
    var currX = shootMonster.curr.x;
    var currY = shootMonster.curr.y;
    // console.log("monsterMove()");
    if (currX == shootMonster.dest.x || currX + PLAYER_SIZE.w > SCREEN_SIZE.w || currX < 0 || currY + PLAYER_SIZE.h > SCREEN_SIZE.h || currY < 0 ) {
        var p = shootMonster.ori;
        shootMonster.ori = shootMonster.dest;
        shootMonster.dest = shootMonster.ori;
        shootMonster.rightdir = !shootMonster.rightdir;
    }
    if (shootMonster.rightdir) {
        // console.log("right :" + (currX + MOVE_DISPLACEMENT));
        shootMonster.curr.x += MOVE_DISPLACEMENT;
        shootMonster.curr.y += MOVE_DISPLACEMENT;
        document.getElementById("smgraph").setAttribute("transform", "scale(-1,1) translate(-"+PLAYER_SIZE.w+", 0)");
        document.getElementById("shootmonster").setAttribute("transform", "translate(" + shootMonster.curr.x +","+ shootMonster.curr.y +")");
    }
    else {
        // console.log("left :" + (currX - MOVE_DISPLACEMENT));
        shootMonster.curr.x -= MOVE_DISPLACEMENT;
        shootMonster.curr.y -= MOVE_DISPLACEMENT;
        document.getElementById("smgraph").setAttribute("transform", "");
        document.getElementById("shootmonster").setAttribute("transform", "translate(" + shootMonster.curr.x +","+ shootMonster.curr.y +")");
    }
}

// The player class used in this program
function Player() {
    this.node = document.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) {
                return true;
        }
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);        // The speed of a bullet


//
// Variables in the game
//
var score = 0;
var left = false;


var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var player = null;                          // The player object
var shootMonster = null;
var gameInterval = null;                    // The interval
var playerName = null;
var bulletNum = 8;

var isASV = false;
var isFF = false;

var timeRemaining = 120000;

var cheatMode = false;
var level = 1;

var upping = false;
var opac = null;

var countdown = null;

var rightshootdir = false;

var disappearing = null;

// reset
function reset() {
    score = 0;
    left = false;

    player = null;                          // The player object
    gameInterval = null;                    // The interval
    bulletNum = 8;
    countdown = null;
    disappearing = null;

    isASV = false;
    isFF = false;

    timeRemaining = 120000;

    cheatMode = false;
    level = 1;

    upping = false;
    opac = null;

    load();
    start();
}

//
// The load function
//
function load() {
    isASV = (window.navigator.appName == "Adobe SVG Viewer");
    isFF = (window.navigator.appName == "Netscape");
    
    document.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
    
    playerName = prompt("Please enter your name.", playerName? playerName : "");
    if (playerName === "" || playerName===null) playerName = "Anonymous";
    document.getElementById("playername").innerHTML = playerName;
   
    // Attach keyboard events
    document.documentElement.addEventListener("keydown", keydown, false);
    document.documentElement.addEventListener("keyup", keyup, false);

    //bulletNum
    document.getElementById("bulletNum").innerHTML = bulletNum;

    //time
    document.getElementById("time").innerHTML = timeRemaining/1000;
}

//
// Start game
//
function start() {
    console.log("start()");

    if (document.getElementById("VP0") == null) document.getElementById("platforms").insertAdjacentHTML("afterbegin", '<rect id="VP0" style="fill:rgb(116, 62, 12)" width="80" height="20" x="280" y="100"/>');
    if (document.getElementById("VP1") == null) document.getElementById("platforms").insertAdjacentHTML("afterbegin", '<rect id="VP1" style="fill:rgb(116, 62, 12)" width="60" height="20" x="160" y="300"/>');
    if (document.getElementById("VP2") == null) document.getElementById("platforms").insertAdjacentHTML("afterbegin", '<rect id="VP2" style="fill:rgb(116, 62, 12)" width="60" height="20" x="480" y="300"/>');

    while (document.getElementById("highscoretext").childNodes.length > 0) {
        document.getElementById("highscoretext").childNodes.item(0).remove();
        console.log("removed");
    }

    document.getElementById("level").innerHTML = "Level " + level;

    playsnd("bgm");
    
    if (level == 1) {
        if(document.getElementById('startScreen') != null) document.getElementById('startScreen').remove(); 
        document.getElementById("monster").insertAdjacentHTML("afterbegin",'<animateTransform id="monAni" type="rotate" attributeName="transform" attributeType="XML" additive="sum" dur="5s" values="0 20 20; -45 20 20; 0 20 20" repeatCount="indefinite"/>');
    }

    // Create the player
    player = new Player();

    //shooting monster
    var sx = 200 + Math.floor(Math.random() * 1000) % 300;
    var sy = 160 + Math.floor(Math.random() * 1000) % 300;
    do {
        var sdx = 200 + Math.floor(Math.random() * 1000) % 300;
        var sdy = 160 + Math.floor(Math.random() * 1000) % 300;
    } while (Math.abs(sx - sdx) < 100 || Math.abs(sy - sdy) < 100);
    // console.log("createshootmon");
    // console.log("sx "+sx + " sy " + sy + " sdx " + sdx + " sdy " + sdy);
    shootMonster = new ShootMonster(sx, sy, sdx, sdy);

    // Create the monsters
    //for num of monsters
        var numMon;
    if (level == 1)  numMon = 5;
    if (level == 2) numMon = 9;
    if (level == 3) numMon = 13;
    var monsters = document.getElementById("monsters");
    while (monsters.childNodes.length < numMon) {
        var x = 200 + Math.floor(Math.random() * 1000) % 400;
        var y = 160 + Math.floor(Math.random() * 1000) % 400;
        
        if (!isPlatform(x,y, 40) && isInArea(x,y, new Size(40,40))) {
            createMonster(x,y);
        }
    }

    //create good things
    var paws = document.getElementById("paws");
    while (paws.childNodes.length < 8) {
        var x = Math.floor(Math.random() * 1000) % SCREEN_SIZE.w;
        var y = Math.floor(Math.random() * 1000) % SCREEN_SIZE.h;
        if (!isPlatform(x,y,20) && isInArea(x,y, new Size(20,20))) {
            createPaw(x,y);
        }
    }

    //countdown seconds
    countdown = setInterval("timeRemaining -= 1000;", 1000);

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

    disappearing = setInterval("disappear()", GAME_INTERVAL);
}


//
// This function creates the monsters in the game
//
function createMonster(x, y) {
    var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    document.getElementById("monsters").appendChild(monster);
}

//
// This function creates the monsters in the game
//
function createPaw(x, y) {
    var paw = document.createElementNS("http://www.w3.org/2000/svg", "use");
    paw.setAttribute("x", x);
    paw.setAttribute("y", y);
    paw.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#paw");
    document.getElementById("paws").appendChild(paw);
}


//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    if (bulletNum > 0) {
        canShoot = false;
        setTimeout("canShoot = true", SHOOT_INTERVAL);

        playsnd("shoot");

        // Create the bullet using the use node
        var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
        bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
        if (left)
            document.getElementById("leftbullets").appendChild(bullet);
        else 
            document.getElementById("rightbullets").appendChild(bullet);
        if (!cheatMode)
            document.getElementById("bulletNum").innerHTML = --bulletNum;
    }
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            break;
			
        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

        case "H".charCodeAt(0):
            if (canShoot) shootBullet();
            break;

        case "C".charCodeAt(0):
            cheatMode = true;
            document.getElementById("cheatMode").style.visibility = "visible";
            break;
        
        case "V".charCodeAt(0):
            cheatMode = false;
            document.getElementById("cheatMode").style.visibility = "hidden";
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// End game
//
function endGame() {
    // Clear the game interval
    clearInterval(gameInterval);
    clearInterval(countdown);
    clearInterval(disappearing);

    // Get the high score table from cookies
    var highScoreTable = getHighScoreTable();

    // // Create the new score record
    var playerName = prompt("Please enter your name", "");
    if (playerName == "") playerName = "Anonymous";
    var record = new ScoreRecord(playerName, score);

    // // Insert the new score record
    var position = 0;
    while (position < highScoreTable.length) {
        var curPositionScore = highScoreTable[position].score;
        if (curPositionScore < score)
            break;

        position++;
    }
    if (position < 5) {
        highScoreTable.splice(position, 0, record);
    }


    // Store the new high score table
    setHighScoreTable(highScoreTable);

    // Show the high score table
    showHighScoreTable(highScoreTable);

    document.getElementById("monAni").remove();

    if (position >=0 && position <= 4)
        document.getElementById("highscoretext").childNodes.item(position*2).style.fill = "red";
}

//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE) && !cheatMode) {
            playsnd("die");
            endGame();
            return;
        }
    }

    if (shootMonster != null && intersect(shootMonster.curr, MONSTER_SIZE, player.position, PLAYER_SIZE) && !cheatMode) {
        playsnd("die");
        endGame();
        return;
    }

    var monbulls = document.getElementById("monbulls");
    if (monbulls.childNodes.length != 0) {
        var x = parseInt(monbulls.childNodes.item(0).getAttribute("x"));
        var y = parseInt(monbulls.childNodes.item(0).getAttribute("y"));

        if (intersect(new Point(x, y), BULLET_SIZE, player.position, PLAYER_SIZE) && !cheatMode) {
            playsnd("die");
            endGame();
            return;
        }
    }

    // Check whether a bullet hits a monster
    var leftbullets = document.getElementById("leftbullets");
    var rightbullets = document.getElementById("rightbullets");
    
    checkBulletColl(leftbullets);
    checkBulletColl(rightbullets);

    //check good things
    var paws = document.getElementById("paws");
    for (var i = 0; i < paws.childNodes.length; i++) {
        var paw = paws.childNodes.item(i);
        var x = parseInt(paw.getAttribute("x"));
        var y = parseInt(paw.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            paws.removeChild(paw);
            score += 5;
        }
    }

    //check portal
    var rightport = document.getElementById("rightport");
    var leftport = document.getElementById("leftport");

    if (intersect(player.position, PLAYER_SIZE, new Point(560, 480), new Size(40, 100)) && player.position.x + PLAYER_SIZE.w == SCREEN_SIZE.w) {
        player.position.x = 20;
        player.position.y = 260;
    }
    else if (intersect(player.position, PLAYER_SIZE, new Point(0, 260), new Size(40, 80)) && player.position.x == 0) {
        player.position.x = 540;
        player.position.y = 480;
    }

    //check exit
    if (player.position.x < 30 && player.position.y < 60 && document.getElementById("paws").childNodes.length == 0) {
        score += timeRemaining/1000;
        score += level++ * 100;
        playsnd("levelup");
        nextLevel();
    }

}

function nextLevel() {
    if (level == 2 || level == 3) {
        clearInterval(gameInterval);
        clearInterval(countdown);
        clearInterval(disappearing);
        timeRemaining = 120000;
        bulletNum = 8;
        alert("Levelc" + level +"\nCongratulations! You are one step near home!");
        start();
    }
    else if (level == 4) {
        endGame();
    }
}

function checkBulletColl(bullets) {
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;

                //write some code to update the score
                score += 10;
                playsnd("killed");
            }

            if (shootMonster != null && intersect(new Point(x, y), BULLET_SIZE, shootMonster.curr, MONSTER_SIZE)) {
                shootMonster.node.setAttribute("visibility", "hidden");
                shootMonster = null;
                bullets.removeChild(bullet);
                i--;

                //write some code to update the score
                score += 10;
                playsnd("killed");
            }
        }
    }
}

//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var rightbullets = document.getElementById("rightbullets");
    for (var i = 0; i < rightbullets.childNodes.length; i++) {
        var node = rightbullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x + BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            rightbullets.removeChild(node);
            i--;
        }
    }

    var leftbullets = document.getElementById("leftbullets");
    for (var i = 0; i < leftbullets.childNodes.length; i++) {
        var node = leftbullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x - BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            leftbullets.removeChild(node);
            i--;
        }
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // console.log("gamePlay()");

    vertPlatDown();

    if (timeRemaining == 0) {
        playsnd("die");
        endGame();
    }

    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT) {
        displacement.x = -MOVE_DISPLACEMENT;
        left = true;
    }
    if (player.motion == motionType.RIGHT) {
        displacement.x = MOVE_DISPLACEMENT;
        left = false;
    }

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets
    moveBullets();

    updateScreen();

    monstershoot();

    monsterMove();

    document.getElementById("score").firstChild.data = score;
    document.getElementById("time").innerHTML = timeRemaining/1000;
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    var transform = "translate(" + player.position.x + "," + player.position.y + ")";
    if (left) {
        var flip = " scale(-1,1)";
        flip = flip + " translate(" + -PLAYER_SIZE.w + ", 0)";
        document.getElementById("playergraphic").setAttribute("transform", flip);
    }
    else{
        var flip = "";//translate(" + -PLAYER_SIZE.w + ", 0)";
        document.getElementById("playergraphic").setAttribute("transform", flip);
    }
    player.node.setAttribute("transform", transform);
    
}

//
// Vertical Platform Down
//
function vertPlatDown() {
    var verticalPlat = document.getElementById("verticalPlat");
    var y = parseInt(verticalPlat.getAttribute("y"));
    if (y == 520) upping = true;
    if (y == 360) upping = false;

    if (upping)
        verticalPlat.setAttribute("y", --y);
    else
        verticalPlat.setAttribute("y", ++y);
}

function disappear() {
    for (var i = 0; i < 3; i++) {
        var name = "VP" + i;
        var VP = document.getElementById(name);
        if (VP == null) continue;
        var x = parseInt(VP.getAttribute("x"));
        var y = parseInt(VP.getAttribute("y"));
        var w = parseInt(VP.getAttribute("width"));
        var h = parseInt(VP.getAttribute("height"));

        if (((player.position.x + PLAYER_SIZE.w > x && player.position.x < x + w) ||
        ((player.position.x + PLAYER_SIZE.w) == x && player.motion == motionType.RIGHT) ||
        (player.position.x == (x + w) && player.motion == motionType.LEFT)) &&
       player.position.y + PLAYER_SIZE.h == y) {
            console.log("disappear");
            clearInterval(disappearing);
            disappearing = null;
            if(name == "VP0") setTimeout("if (document.getElementById('VP0') != null) document.getElementById('VP0').remove()", 3000);
            if(name == "VP1") setTimeout("if (document.getElementById('VP1') != null) document.getElementById('VP1').remove()", 3000);
            if(name == "VP2") setTimeout("if (document.getElementById('VP2') != null) document.getElementById('VP2').remove()", 3000);
            VP.insertAdjacentHTML("afterbegin",'<animate id="Ani" attributeType="XML" attributeName="fill-opacity" from="1" to="0" begin="indfinite" dur="5s" repeatCount="none"  />');
            document.getElementById("Ani").beginElement();
            setTimeout('if (disappearing == null) disappearing = setInterval("disappear()", GAME_INTERVAL)', 3000);
        }
    }
}

