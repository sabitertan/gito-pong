// Simple vanilla JS test runner for Pong game logic
// Open this file in the browser to see test results in the console

// Import functions from main.js (if using modules, adjust as needed)
// For now, we'll assume some functions are globally accessible or mock them

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`%c✔ PASS: ${message}`, 'color: green');
  } else {
    console.error(`%c✖ FAIL: ${message}\n  Expected: ${expected}\n  Got: ${actual}`,'color: red');
  }
}

// Example: Test ball speed increases with level
function testBallSpeedIncrease() {
  // Mock or use actual logic from main.js
  let baseSpeed = 4;
  let speedIncrease = 0.5;
  let getBallSpeed = (level) => baseSpeed + (level - 1) * speedIncrease;

  assertEqual(getBallSpeed(1), 4, 'Ball speed at level 1 is base speed');
  assertEqual(getBallSpeed(5), 6, 'Ball speed at level 5 is correct');
  assertEqual(getBallSpeed(10), 8.5, 'Ball speed at level 10 is correct');
}

testBallSpeedIncrease();

// Add more tests for paddle movement, collision, scoring, etc.
// Example: Test paddle stays in bounds
function testPaddleBounds() {
  let playAreaHeight = 400;
  let paddleHeight = 80;
  let clamp = (y) => Math.max(0, Math.min(y, playAreaHeight - paddleHeight));

  assertEqual(clamp(-10), 0, 'Paddle does not go above play area');
  assertEqual(clamp(350), 320, 'Paddle does not go below play area');
  assertEqual(clamp(100), 100, 'Paddle stays within bounds');
}

testPaddleBounds();

// You can add more tests below following the same pattern
