const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 30;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    hasWallAt(x, y){
        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return true;
        }
        var mapGridIndexX = Math.floor(x / TILE_SIZE);
        var mapGridIndexY = Math.floor(y / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX] != 0;
    }
    render () {
        for (let i = 0; i < MAP_NUM_ROWS; i++){
            for (let j = 0; j < MAP_NUM_COLS; j++){
                var tileX = j * TILE_SIZE;
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? '#222' : '#fff';
                stroke('#222')
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            };
        };
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 3;
        this.turnDirection = 0;  // -1 if left, +1 if right
        this.walkDirection = 0;  // -1 if back, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 2 * (Math.PI / 180);
    }
    update() {
        //TODO: update player posistion based on turnDirection and WalkDirection
        this.rotationAngle += this.turnDirection * this.rotationSpeed;

        var moveStep = this.walkDirection * this.moveSpeed;

        var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

        //only set new player posistion if it is not colliding with the map walls
        if(!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    render() {
        noStroke();
        fill('red');
        circle(this.x, this.y, this.radius);
        stroke('red');
        line(
            this.x, 
            this.y, 
            this.x + Math.cos(this.rotationAngle) * 30,
            this.y + Math.sin(this.rotationAngle) * 30
        );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast(columnId) {
        var xintercept, yintercept;
        var xstep, ystep;

        // HORIZONTAL RAY-GRID INTERSECTION CODE

        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;

        // console.log('isRayFacingRight?', this.isRayFacingRight)

        //Find the y-coordinate of the closest horizontal grid intersection
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

        //Find the x-coordinate of the closest horizontal grid intersection
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        //Calculate the increment xstep and ystep
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;

        if (this.isRayFacingUp) {
            nextHorzTouchY--;
        }
        // Increment xstep and ystep untill we find the wall
        while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY)) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;

                break;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep
            }
        }

        // VERTICAL RAY-GRID INTERSECTION CODE
        
        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;

        // console.log('isRayFacingRight?', this.isRayFacingRight)

        //Find the x-coordinate of the closest vertical grid intersection
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

        //Find the y-coordinate of the closest vertical grid intersection
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        //Calculate the increment xstep and ystep
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;

        if (this.isRayFacingUp) {
            nextVertTouchY--;
        }
        // Increment xstep and ystep untill we find the wall
        while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextVertTouchX, nextVertTouchY)) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;

                break;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep
            }
        }
    }
    render() {
        stroke('rgba(225, 0, 0, 0.3)')
        line(
            player.x, 
            player.y, 
            player.x + Math.cos(this.rayAngle) * 30,
            player.y + Math.sin(this.rayAngle) * 30
        )
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = +1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = +1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased(){
    if (keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    }
}

function castAllRays() {
    var columId = 0;

    //start first ray subtracting half of the FOV
    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    //loop all columns casting the rays
    for (let i = 0; i < NUM_RAYS; i++) {
    // for (let i = 0; i < 1; i++) {
        var ray = new Ray(rayAngle);
        ray.cast(columId);
        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;

        columId++;
    }
}

function normalizeAngle(angle){
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function setup() {
    //TODO: initialize all object
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update(params) {
    //TODO: update all game objects before we render the next frame
    player.update();
}

function draw() {
    //TODO: render all objects frame by frame
    update();

    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
    castAllRays();
}




