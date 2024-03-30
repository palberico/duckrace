import React, { Component } from 'react';
import duckImage from '../assets/images/DuckGame.png';
import redCarImage from '../assets/images/RedCar.png';
import blueCarImage from '../assets/images/BlueCar.png';
import greenCarImage from '../assets/images/GreenCar.png';
import orangeCarImage from '../assets/images/OrangeCar.png';
import explosionImage from '../assets/images/Explosion.png';

class DuckGame extends Component {
    constructor(props) {
        super(props);
    this.canvasRef = React.createRef();

    // Initialize the state
    this.state = this.getInitialState();

    // Load the duck image
    this.duck = new Image();
    this.duck.src = duckImage;

    // Load the explosion image
    this.explosionImg = new Image();
    this.explosionImg.src = explosionImage;

    // Optional: Use onload to confirm the image has loaded
    this.explosionImg.onload = () => {
        console.log('Explosion image loaded');
        // Ensure the image is assigned to state only after it has loaded
        this.setState({ explosionImage: this.explosionImg });
    };
    }

    getInitialState = () => ({
        duckX: 275, // Example initial X, assuming roadWidth and roadStart calculations
        rightPressed: false,
        leftPressed: false,
        obstacles: [],
        curbOffset: 0,
        carImages: {},
        obstacleSpeed: 2,
        difficultyLevel: 1,
        gameOver: false,
        collidedObstacleIndex: null,
        explosionImage: null,
        curbs: [],
        showGameOverScreen: false,
    });

    componentDidMount() {
        this.setupEventListeners();
        this.loadCarImages();
        this.gameLoop();
        this.increaseDifficultyInterval = setInterval(this.increaseDifficulty, 30000);
    
        // Add click event listener for the canvas
        this.canvasRef.current.addEventListener('click', this.handleCanvasClick);
    }
    
    handleCanvasClick = (event) => {
        const rect = this.canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        // Check if click is within the restart button bounds
        if (
            x > this.canvasRef.current.width / 2 - 75 &&
            x < this.canvasRef.current.width / 2 + 75 &&
            y > this.canvasRef.current.height / 2 &&
            y < this.canvasRef.current.height / 2 + 40
        ) {
            this.restartGame();
        }
    };

    setupEventListeners = () => {
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    };

    loadCarImages = () => {
        const carImages = {
            redCar: new Image(),
            greenCar: new Image(),
            blueCar: new Image(),
            orangeCar: new Image(),
        };
        // Set sources for car images
        carImages.redCar.src = redCarImage;
        carImages.greenCar.src = greenCarImage;
        carImages.blueCar.src = blueCarImage;
        carImages.orangeCar.src = orangeCarImage;

        const explosionImg = new Image();
        explosionImg.src = explosionImage;

        this.setState({ carImages, explosionImage: explosionImg }, this.setObstacles);
    };

    setObstacles = () => {
        const roadWidth = 800 / 3;
        const roadStart = (800 - roadWidth) / 2;
        const obstacles = [
            { image: 'redCar', x: roadStart + roadWidth / 3 - 25, y: -50, width: 50, height: 50 },
            { image: 'blueCar', x: roadStart + roadWidth / 3, y: -250, width: 50, height: 50 },
            { image: 'greenCar', x: roadStart + roadWidth / 3 * 2, y: -450, width: 50, height: 50 },
            { image: 'orangeCar', x: roadStart + roadWidth - 50, y: -650, width: 50, height: 50 },
        ];
        this.setState({ obstacles });
    };

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyDownHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
        cancelAnimationFrame(this.animationFrameId);
        clearInterval(this.increaseDifficultyInterval);
    
        // Remove click event listener
        this.canvasRef.current.removeEventListener('click', this.handleCanvasClick);
    }

    gameLoop = () => {
        if (!this.state.gameOver) {
            this.draw();
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    };

    increaseDifficulty = () => {
        this.setState(prevState => ({
            difficultyLevel: prevState.difficultyLevel + 1,
            obstacleSpeed: prevState.obstacleSpeed + 1,
        }));
    };

    keyDownHandler = (e) => {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.setState({ rightPressed: true });
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.setState({ leftPressed: true });
        }
    };

    keyUpHandler = (e) => {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.setState({ rightPressed: false });
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.setState({ leftPressed: false });
        }
    };

    moveDuck = () => {
        const { duckX, rightPressed, leftPressed } = this.state;
        const canvas = this.canvasRef.current;
        const roadWidth = canvas.width / 2;
        const roadStart = (canvas.width - roadWidth) / 2;
        const duckWidth = 54;
        const roadEnd = roadStart + roadWidth - duckWidth;
        if (rightPressed && duckX < roadEnd) {
            this.setState({ duckX: duckX + 7 });
        } else if (leftPressed && duckX > roadStart) {
            this.setState({ duckX: duckX - 7 });
        }
    };

    drawRoad = (ctx) => {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const roadWidth = canvasWidth / 2;
        const roadStart = (canvasWidth - roadWidth) / 2;
        const grassWidth = roadStart; 
    
        // Gradient for the road to simulate lighting and depth
        let roadGradient = ctx.createLinearGradient(roadStart, 0, roadStart + roadWidth, 0);
        roadGradient.addColorStop(0, '#505050'); // Darker at the edges
        roadGradient.addColorStop(0.5, '#585858'); // Lighter in the center
        roadGradient.addColorStop(1, '#505050'); // Darker at the edges again
    
        ctx.fillStyle = roadGradient;
        ctx.fillRect(roadStart, 0, roadWidth, canvasHeight);
    
        // Define the hex codes for your gradients
        const darkGreenHex = '#006400'; // Darker green
        const lighterGreenHex = '#138c13'; // Lighter but not too light green
    
        // Create gradient for the grass on the left
        let grassGradientLeft = ctx.createLinearGradient(0, 0, grassWidth, 0);
        grassGradientLeft.addColorStop(0, lighterGreenHex);
        grassGradientLeft.addColorStop(1, darkGreenHex);
    
        // Draw the left grass area with the gradient
        ctx.fillStyle = grassGradientLeft;
        ctx.fillRect(0, 0, grassWidth, canvasHeight);
    
        // Create gradient for the grass on the right
        let grassGradientRight = ctx.createLinearGradient(canvasWidth - grassWidth, 0, canvasWidth, 0);
        grassGradientRight.addColorStop(0, darkGreenHex);
        grassGradientRight.addColorStop(1, lighterGreenHex);
    
        // Draw the right grass area with the gradient
        ctx.fillStyle = grassGradientRight;
        ctx.fillRect(canvasWidth - grassWidth, 0, grassWidth, canvasHeight);
    };


    updateCurbs = () => {
        // Half the obstacle speed for the curb scrolling speed
        const curbSpeed = this.state.obstacleSpeed * 2;
        const { curbOffset } = this.state;
        const newCurbOffset = (curbOffset + curbSpeed) % (20 * 2); // 20 is the height of a curb segment, multiplied by 2 for the space
    
        this.setState({ curbOffset: newCurbOffset });
    };

    drawDuck = (ctx) => {
        const { duckX } = this.state;
        const canvas = this.canvasRef.current;
        const duckWidth = 50;
        const duckHeight = 50;
        const duckY = (canvas.height - duckHeight) / 1.25;
        ctx.drawImage(this.duck, duckX, duckY, duckWidth, duckHeight);
    };

    drawObstacles = (ctx) => {
        const { obstacles, carImages } = this.state;
        obstacles.forEach(obstacle => {
            const img = carImages[obstacle.image];
            if (img) {
                ctx.drawImage(img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    };

    updateObstacles = () => {
        const { obstacles, obstacleSpeed } = this.state;
        const canvas = this.canvasRef.current;
        const roadWidth = canvas.width / 2;
        const roadStart = (canvas.width - roadWidth) / 2;
        const updatedObstacles = obstacles.map(obstacle => {
            let newY = obstacle.y + obstacleSpeed;
            if (newY > canvas.height) {
                newY = -obstacle.height;
                const obstaclePosition = roadStart + (Math.random() * (roadWidth - obstacle.width));
                return { ...obstacle, y: newY, x: obstaclePosition };
            }
            return { ...obstacle, y: newY };
        });
        this.setState({ obstacles: updatedObstacles });
    };

    draw = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        this.drawRoad(ctx);
        this.drawDuck(ctx);
        this.drawCurbs(ctx);
    
        if (!this.state.gameOver) {
            this.checkCollisions();
            this.drawObstacles(ctx);
            this.moveDuck();
            this.updateObstacles();
            this.updateCurbs();
        } else {
            this.handleGameOver(ctx);
    
            // Draw the "Game Over" text
            ctx.font = '48px serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        }
    };
    
    drawCurbs = (ctx) => {
        // Use ctx to draw curbs
        const { curbOffset } = this.state;
        const roadWidth = ctx.canvas.width / 2;  // Use ctx.canvas to get the width
        const roadStart = (ctx.canvas.width - roadWidth) / 2;
        const curbWidth = 10;
        const curbHeight = 20;
    
        for (let y = curbOffset - curbHeight; y < ctx.canvas.height; y += curbHeight * 2) {
            ctx.fillStyle = 'red';
            ctx.fillRect(roadStart - curbWidth, y, curbWidth, curbHeight);
    
            ctx.fillStyle = 'white';
            ctx.fillRect(roadStart - curbWidth, y + curbHeight, curbWidth, curbHeight);
    
            ctx.fillStyle = 'red';
            ctx.fillRect(roadStart + roadWidth, y, curbWidth, curbHeight);
    
            ctx.fillStyle = 'white';
            ctx.fillRect(roadStart + roadWidth, y + curbHeight, curbWidth, curbHeight);
        }
    };

    checkCollisions = () => {
        const { duckX, obstacles } = this.state;
        const duckWidth = 50; // Width of the duck image
        const duckHeight = 50; // Height of the duck image
        const canvas = this.canvasRef.current;
        const duckY = (canvas.height - duckHeight) / 1.25; // Vertical center position as used in drawDuck
    
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
           
            if (duckX < obstacle.x + obstacle.width &&
                duckX + duckWidth > obstacle.x &&
                duckY < obstacle.y + obstacle.height &&
                duckY + duckHeight > obstacle.y) {
               
                this.setState({
                    gameOver: true,
                    collidedObstacleIndex: i
                });
                this.gameOver();
                break;
            }
        }
    };
    
//Game Over code follows

gameOver = () => {
    cancelAnimationFrame(this.animationFrameId);
    clearInterval(this.increaseDifficultyInterval);

    this.setState({
        gameOver: true,
    }, () => {
        // Redraw the canvas to show the game over state immediately
        this.draw();
    });
};

handleGameOver = (ctx) => {
    // Draw explosion if there was a collision
    const collidedObstacle = this.state.collidedObstacleIndex !== null 
        ? this.state.obstacles[this.state.collidedObstacleIndex] 
        : null;

    if (collidedObstacle && this.state.explosionImage) {
        ctx.drawImage(
            this.state.explosionImage,
            collidedObstacle.x,
            collidedObstacle.y,
            collidedObstacle.width,
            collidedObstacle.height
        );
    }

    // Draw restart button
    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonX = this.canvasRef.current.width / 2 - buttonWidth / 2;
    const buttonY = this.canvasRef.current.height / 2 + 20;
    ctx.fillStyle = '#00FF00'; // Green color for the button
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw the text "Restart" centered in the button
    ctx.font = '20px serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center'; // This ensures the text is centered
    ctx.textBaseline = 'middle'; // This aligns the text vertically in the middle
    // Calculate the center of the button
    const textX = buttonX + buttonWidth / 2;
    const textY = buttonY + buttonHeight / 2;
    ctx.fillText('Play Again', textX, textY);
};

restartGame = () => {
    this.setState(this.getInitialState(), () => {
        this.loadCarImages();
        this.gameLoop();
        this.increaseDifficultyInterval = setInterval(this.increaseDifficulty, 30000);
    });
};

render() {
    return (
        <div className="game-container">
            <canvas ref={this.canvasRef} width="800" height="600" style={{ border: '1px solid black' }} />
        </div>
    );
}
}

export default DuckGame;
