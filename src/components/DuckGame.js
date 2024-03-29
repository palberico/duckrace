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
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 800;
        this.offscreenCanvas.height = 600;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        const roadWidth = 800 / 3;
        const roadStart = (800 - roadWidth) / 2;
        this.state = {
            duckX: roadStart + (roadWidth - 150) / 2,
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
        };
        this.duck = new Image();
        this.duck.onload = () => {
            this.setState({ duckImage: this.duck });
        };
        this.duck.src = duckImage; 
    }
    
    componentDidMount() {
        this.setupEventListeners();
        this.loadCarImages();
        this.gameLoop();
        this.increaseDifficultyInterval = setInterval(this.increaseDifficulty, 30000);
    }

    setupEventListeners() {
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    }

    loadCarImages = () => {
        const carImages = {
            redCar: new Image(),
            greenCar: new Image(),
            blueCar: new Image(),
            orangeCar: new Image(),
        };
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
    }

    gameLoop = () => {
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
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

    drawCurbs = (ctx) => {
        const { curbOffset } = this.state;
        const roadWidth = this.offscreenCanvas.width / 2;
        const roadStart = (this.offscreenCanvas.width - roadWidth) / 2;
        const curbWidth = 10;
        const curbHeight = 20;

        for (let y = curbOffset - curbHeight; y < this.canvasRef.current.height; y += curbHeight * 2) {
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

    updateCurbs = () => {
        const { obstacleSpeed, curbOffset } = this.state;
        const newCurbOffset = (curbOffset + obstacleSpeed) % (20 * 2); 

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
    
    gameOver = () => {
        cancelAnimationFrame(this.animationFrameId); 
        clearInterval(this.increaseDifficultyInterval);

        // Trigger a "game over" screen or logic here

    };

    handleGameOver = (ctx) => {
        const collidedObstacle = this.state.obstacles[this.state.collidedObstacleIndex];
        if (collidedObstacle) {
            ctx.drawImage(
                this.state.explosionImage,
                collidedObstacle.x,
                collidedObstacle.y,
                collidedObstacle.width,
                collidedObstacle.height
            );
        }
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