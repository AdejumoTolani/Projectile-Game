const canvas = document.querySelector("canvas");
const score = document.querySelector("#scoreEl");
const startBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const bigScore = document.querySelector("#bigScore");
canvas.width = innerWidth;
canvas.height = innerHeight;
let count = 0;
const ctx = canvas.getContext("2d");

class Player {
  constructor(x, y, radius, colour) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.colour;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, colour, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.colour;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, colour, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.colour;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;

class Particle {
  constructor(x, y, radius, colour, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.colour;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}
function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
      // y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const colour = `hsl(${Math.random() * 360},50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle) / 2,
      y: Math.sin(angle) / 2,
    };
    enemies.push(new Enemy(x, y, radius, colour, velocity));
  }, 1000);
}
const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 20, "white");
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
  player = new Player(x, y, 20, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  count = 0;
  score.innerHTML = count;
  bigScore.innerHTML = count;
  // console.log(bigScore, bigScore.innerHTML)
}

let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
    particle.update();
  });
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    //enemy hits us
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      bigScore.innerHTML = count;
      // startBtn.innerHTML = 'Restart Game';
      modalEl.style.display = "flex";
    }
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        //create particle explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.colour,
              {
                x: (Math.random() - 0.5) * Math.random() * 6,
                y: (Math.random() - 0.5) * Math.random() * 6,
              }
            )
          );
        }
        if (enemy.radius - 10 > 10) {
          count += 100;
          score.innerHTML = count;

          // gsap.to(enemy, {
          //   radius: enemy.radius - 10
          // })
          enemy.radius = enemy.radius - 10;
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          count += 250;
          score.innerHTML = count;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}
addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - y, e.clientX - x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(new Projectile(x, y, 5, "white", velocity));
});
startBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
});
