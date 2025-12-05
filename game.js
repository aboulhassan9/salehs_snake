(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const GRID_SIZE = 20;
    const GRID_WIDTH = canvas.width / GRID_SIZE;
    const GRID_HEIGHT = canvas.height / GRID_SIZE;

    const MODES = { beginner: { speed: 150 }, intermediate: { speed: 100 }, advanced: { speed: 70 } };

    let snake = [];
    let direction = { x:1, y:0 };
    let nextDirection = { x:1, y:0 };
    let food = {};
    let score=0;
    let foodCollected=0;
    let highScore=0;
    let isGameOver=false;
    let currentMode='beginner';
    let lastTime=0;

    function loadHighScore() {
        const saved = localStorage.getItem('snakeHighScore');
        if(saved) { highScore=parseInt(saved); document.getElementById('highScore').textContent=highScore; }
    }

    function saveHighScore() {
        if(score>highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
    }

    function init() {
        snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
        direction = {x:1,y:0};
        nextDirection = {x:1,y:0};
        score=0;
        foodCollected=0;
        isGameOver=false;
        updateStats();
        spawnFood();
        document.getElementById('gameOver').style.display='none';
        lastTime=0;
        requestAnimationFrame(mainLoop);
    }

    function mainLoop(timestamp) {
        if(isGameOver) return;
        if(!lastTime) lastTime=timestamp;
        const elapsed = timestamp - lastTime;
        if(elapsed > MODES[currentMode].speed) {
            update();
            lastTime = timestamp;
        }
        requestAnimationFrame(mainLoop);
    }

    function update() {
        direction = { x: nextDirection.x, y: nextDirection.y };
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // Wrap edges
        if(head.x<0) head.x = GRID_WIDTH-1;
        if(head.x>=GRID_WIDTH) head.x = 0;
        if(head.y<0) head.y = GRID_HEIGHT-1;
        if(head.y>=GRID_HEIGHT) head.y = 0;

        // Self collision
        for(let seg of snake) {
            if(seg.x === head.x && seg.y === head.y) { endGame(); return; }
        }

        snake.unshift(head);

        if(head.x===food.x && head.y===food.y) {
            score += 10;
            foodCollected++;
            updateStats();
            spawnFood();
        } else {
            snake.pop();
        }

        render();
    }

    function render() {
        ctx.fillStyle='#1a1a2e';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // Snake
        snake.forEach((seg,i)=>{
            ctx.fillStyle = (i===0)?'#4CAF50':'rgba(69,160,73,0.7)';
            ctx.fillRect(seg.x*GRID_SIZE+1, seg.y*GRID_SIZE+1, GRID_SIZE-2, GRID_SIZE-2);
        });

        // Food
        ctx.fillStyle='#ff6b6b';
        ctx.beginPath();
        ctx.arc(food.x*GRID_SIZE+GRID_SIZE/2, food.y*GRID_SIZE+GRID_SIZE/2, GRID_SIZE/2-2,0,Math.PI*2);
        ctx.fill();
    }

    function spawnFood() {
        let valid=false;
        while(!valid) {
            food={x:Math.floor(Math.random()*GRID_WIDTH), y:Math.floor(Math.random()*GRID_HEIGHT)};
            valid = !snake.some(seg => seg.x===food.x && seg.y===food.y);
        }
    }

    function updateStats() {
        document.getElementById('score').textContent = score;
        document.getElementById('foodCount').textContent = foodCollected;
    }

    function endGame() {
        isGameOver=true;
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalFood').textContent = foodCollected;
        document.getElementById('gameOver').style.display='block';
        saveHighScore();
    }

    document.addEventListener('keydown', function(e) {
        if(isGameOver) return;
        if(e.key==='ArrowUp' && direction.y!==1) nextDirection={x:0,y:-1};
        else if(e.key==='ArrowDown' && direction.y!==-1) nextDirection={x:0,y:1};
        else if(e.key==='ArrowLeft' && direction.x!==1) nextDirection={x:-1,y:0};
        else if(e.key==='ArrowRight' && direction.x!==-1) nextDirection={x:1,y:0};
    });

    document.getElementById('restartBtn').addEventListener('click', init);

    loadHighScore();
    init();
})();
