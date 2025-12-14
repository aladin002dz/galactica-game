// script.js - Galactica Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Fixed game resolution
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function resizeCanvas() {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
}
resizeCanvas();

// Load assets
const playerImg = new Image();
playerImg.src = 'assets/player.png';
const enemyImg = new Image();
enemyImg.src = 'assets/enemy.png';

// Game state
let player = {
  x: GAME_WIDTH / 2 - 25,
  y: GAME_HEIGHT - 80,
  width: 50,
  height: 50,
  speed: 5,
  lives: 3,
};
let bullets = [];
let enemies = [];
let score = 0;
let keys = {};
// Particle system for explosions
let particles = [];

// Input handling
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

function spawnEnemy() {
  const size = 50;
  const x = Math.random() * (GAME_WIDTH - size);
  enemies.push({
    x,
    y: -size,
    width: size,
    height: size,
    speed: 2 + Math.random() * 2
  });
}

let enemySpawnTimer = 0;
const enemySpawnInterval = 90; // frames

function update() {
  // Player movement
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if (keys['ArrowDown'] || keys['s']) player.y += player.speed;

  // Keep within bounds
  player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.height, player.y));

  // Update particles (explosions)
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);

  // Shooting (Space)
  if (keys[' '] && bullets.length < 5) {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 15,
      speed: 10,
      color: '#0ff'
    });
    keys[' '] = false; // simple debounce
  }

  // Update bullets
  bullets.forEach(b => b.y -= b.speed);
  bullets = bullets.filter(b => b.y + b.height > 0);

  // Spawn enemies
  enemySpawnTimer++;
  if (enemySpawnTimer >= enemySpawnInterval) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  // Update enemies
  enemies.forEach(e => e.y += e.speed);
  enemies = enemies.filter(e => e.y < GAME_HEIGHT + e.height);

  // Collision detection
  enemies.forEach((e, ei) => {
    // Player collision
    if (rectIntersect(player, e)) {
      player.lives--;
      enemies.splice(ei, 1);
      updateLivesUI();
    }
    // Bullet collision
    bullets.forEach((b, bi) => {
      if (rectIntersect(b, e)) {
        score += 10;
        // Trigger explosion effect
        createExplosion(e.x + e.width / 2, e.y + e.height / 2);
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        updateScoreUI();
      }
    });
  });

  // Game over
  if (player.lives <= 0) {
    alert('Game Over! Your score: ' + score);
    resetGame();
  }
}

function rectIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// Create a simple blast effect at (x, y)
function createExplosion(x, y) {
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: Math.random() * 30 + 20,
      color: 'rgba(255,200,0,' + (Math.random() * 0.5 + 0.5) + ')'
    });
  }
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  if (playerImg.complete) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0ff';
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;
  } else {
    // Fallback
    ctx.fillStyle = '#0ff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // Draw enemies
  enemies.forEach(e => {
    if (enemyImg.complete) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f00';
      ctx.drawImage(enemyImg, e.x, e.y, e.width, e.height);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#f00';
      ctx.fillRect(e.x, e.y, e.width, e.height);
    }
  });

  // Draw bullets
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    ctx.shadowBlur = 0;
  });
  // Draw particles (explosions)
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function updateScoreUI() {
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = 'Score: ' + score;
}
function updateLivesUI() {
  const livesEl = document.getElementById('lives');
  if (livesEl) livesEl.textContent = 'Lives: ' + player.lives;
}
function resetGame() {
  player.lives = 3;
  score = 0;
  bullets = [];
  enemies = [];
  updateScoreUI();
  updateLivesUI();
}

// Start loop
requestAnimationFrame(gameLoop);
