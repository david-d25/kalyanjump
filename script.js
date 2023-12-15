const canvas = document.getElementById("canvas");
const graphics = canvas.getContext('2d');
const doodleImage = new Image();
doodleImage.src = "img/doodle.png";
const platformImage = new Image();
platformImage.src = "img/platform.png";
const backgroundImage = new Image();
backgroundImage.src = "img/background.jpg";

let scrollY = 0;
const gravity = 1;
const doodle = {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    speed: {
        x: 0,
        y: 0,
    },
    userAccelerationX: 0
};

let platforms = [];
let particles = [];

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("touchstart", onTouchStart);
window.addEventListener("touchend", onTouchEnd);
window.addEventListener("touchmove", onTouchMove);
startGame();

function startGame() {
    setInterval(update, 1000/60);
    doodle.x = 50;
    doodle.y = 400;
}

function update() {
    platformGeneratorTick();

    if (doodle.y > -scrollY + canvas.height) {
        scrollY = 0;
        platforms = [];
        doodle.x = 50;
        doodle.y = 400;
        doodle.speed.x = 0;
        doodle.speed.y = 0;
    }

    doodle.speed.x += doodle.userAccelerationX;

    if (doodle.x > canvas.width) {
        doodle.x = -doodle.width
    }
    if (doodle.x < -doodle.width) {
        doodle.x = canvas.width;
    }

    doodle.speed.y += gravity;
    doodle.x += doodle.speed.x;
    doodle.y += doodle.speed.y;
    if (doodle.y + doodle.height > canvas.height) {
        doodle.speed.y = -30;
    }
    doodle.speed.x = doodle.speed.x * 0.99;
    processCollisions();

    const doodleScroll = -doodle.y + canvas.height/5;
    if (doodleScroll > scrollY) {
        scrollY = doodleScroll;
    }

    for (let i = 0; i < 3; i++) {
        spawnParticle(
            doodle.x + 10 + Math.random() * 20 - 10,
            doodle.y + 200 + Math.random() * 20 - 10,
            25 + Math.random() * 150
        );
    }

    for (let i = 0; i < particles.length; i++) {
        particles[i].opacity -= 0.01;
        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    draw();
}

function processCollisions() {
    if (doodle.speed.y < 0) {
        return;
    }
    const doodleLeftX = doodle.x;
    const doodleRightX = doodleLeftX + doodle.width;
    for (const platform of platforms) {
        const platformLeftX = platform.x;
        const platformRightX = platformLeftX + platform.width;
        if (doodleRightX < platformLeftX)
            continue;
        if (doodleLeftX > platformRightX)
            continue;
        const bottomY = doodle.y + doodle.height;
        if (bottomY > platform.y && bottomY < platform.y + platform.height) {
            doodle.speed.y = -30;
        }
    }
}

function platformGeneratorTick() {
    let hightestPlatformY = canvas.height;
    if (platforms.length != 0) {
        for (const platform of platforms) {
            if (platform.y < hightestPlatformY)
                hightestPlatformY = platform.y;
        }
    }

    let generateThreshold = -scrollY;
    while (generateThreshold < hightestPlatformY) {
        let x = Math.random() * canvas.width;
        let y = hightestPlatformY - 200 - Math.random() * 150;
        spawnPlatform(x, y);
        hightestPlatformY = y;
    }
}

function draw() {
    graphics.save();
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    graphics.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    graphics.translate(0, scrollY);

    // Платформы
    for (const platform of platforms) {
        graphics.drawImage(
            platformImage,
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );
    }
    
    // Рисование дудла
    graphics.drawImage(
        doodleImage,
        doodle.x,
        doodle.y,
        doodle.width,
        doodle.height
    );

    for (const p of particles) {
        const gradient = graphics.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size/2);
        gradient.addColorStop(0, `rgba(200, 200, 200, ${p.opacity})`);
        gradient.addColorStop(1, `rgba(200, 200, 200, 0)`);
        graphics.fillStyle = gradient;
        graphics.beginPath();
        graphics.arc(p.x, p.y, p.size/2, 0, Math.PI*2);
        graphics.fill();
    }

    graphics.restore();
    graphics.font = "24px Arial";
    graphics.fillStyle = "white";
    graphics.fillText("Score: " + scrollY, 25, 25);
}

function spawnPlatform(centerX, topY) {
    const width = 200;
    const height = 25;
    platforms.push({
        x: centerX - width/2,
        y: topY,
        width: width,
        height: height
    });
}

function spawnParticle(x, y, size) {
    particles.push({
        x, y, size,
        opacity: 0.25
    });
}

function onKeyDown(event) {
    if (event.code == "ArrowRight") {
        doodle.userAccelerationX = 1;
    } else if (event.code == "ArrowLeft") {
        doodle.userAccelerationX = -1;
    }
}

function onKeyUp(event) {
    doodle.userAccelerationX = 0;
}

function onTouchMove(event) {
    onTouchStart(event);
}

function onTouchStart(event) {
    if (event.touches.length == 1) {
        const touch = event.touches[0];
        const x = touch.clientX;
        if (x > window.innerWidth/2) {
            doodle.userAccelerationX = 1;
        } else {
            doodle.userAccelerationX = -1;
        }
    } else {
        doodle.userAccelerationX = 0;
    }
}

function onTouchEnd(event) {
    doodle.userAccelerationX = 0;
}