// script.js - Simple Galactica game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to fill viewport
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game state
let player = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  width: 40,
  height: 60,
  speed: 5,
  color: '#0ff',
  lives: 3,
};
let bullets = [];
let enemies = [];
let score = 0;
let keys = {};

// Input handling
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

function spawnEnemy() {
  const size = 40;
  const x = Math.random() * (canvas.width - size);
  enemies.push({ x, y: -size, width: size, height: size, speed: 2 + Math.random() * 2, color: '#f00' });
}

let enemySpawnTimer = 0;
const enemySpawnInterval = 90; // frames

function update() {
  // Player movement (arrow keys or WASD)
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
  // Keep within bounds
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  // Shooting (Space)
  if (keys[' '] && bullets.length < 5) {
    bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10, speed: 7, color: '#ff0' });
    // simple debounce
    keys[' '] = false;
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
  enemies = enemies.filter(e => e.y < canvas.height + e.height);

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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw player (simple triangle ship)
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // Draw bullets
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // Draw enemies (simple squares)
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.width, e.height);
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
