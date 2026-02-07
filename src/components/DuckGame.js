import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';

import StartComponent from './StartComponent';
import startImage from '../assets/images/crashDuck.png';

import duckImage from '../assets/images/cars/DuckGame.png';
import redCarImage from '../assets/images/cars/RedCar.png';
import explosionImage from '../assets/images/Explosion.png';
import blueCarImage from '../assets/images/cars/BlueCar.png';
import greenCarImage from '../assets/images/cars/GreenCar.png';
import orangeCarImage from '../assets/images/cars/OrangeCar.png';

import '../DuckGame.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const ROAD_WIDTH = GAME_WIDTH / 2; // 400
const ROAD_START = (GAME_WIDTH - ROAD_WIDTH) / 2; // 200
const ROAD_END = ROAD_START + ROAD_WIDTH; // 600

const SCORE_POSITION = { x: 20, y: 30 };

class DuckGame extends Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();

        // Initialize the state
        this.state = this.getInitialState();

        // Load the start image
        this.startImg = new Image();
        this.startImg.onload = () => {
            // Set the flag to true and call draw to ensure the image is drawn
            this.setState({ startImageLoaded: true }, this.draw);
        };
        this.startImg.src = startImage; // This should be after defining onload

        // Load the duck image
        this.duck = new Image();
        this.duck.src = duckImage;

        // Load the explosion image
        this.explosionImg = new Image();
        this.explosionImg.src = explosionImage;
        this.explosionImg.onload = () => {
            if (this.isComponentMounted) {
                this.setState({ explosionImage: this.explosionImg });
            }
        };
    }

    getInitialState = () => ({
        // UI-related state that requires re-rendering
        gameOver: false,
        showGameOverScreen: false,
        startSequenceFinished: false,
        showStartComponent: false,
        startImageLoaded: false,
        isGameActive: false,
        carImages: {},
        explosionImage: null,
    });

    // Initialize physics state (non-React state)
    initGameState = () => {
        this.gameState = {
            duckX: 275,
            rightPressed: false,
            leftPressed: false,
            obstacles: [],
            curbOffset: 0,
            // SPEEDS IN PIXELS PER SECOND (previously per frame @ 60fps)
            // Old: 220px/s -> New: 180px/s (Slower, more relaxed)
            obstacleSpeed: 180,
            // Old: 1px/frame * 60 = 60px/s (start difficulty)
            difficultyLevel: 1,
            collidedObstacleIndex: null,
            score: 0,
            curbs: [],
            // Duck speed: 500px/s -> New: 460px/s
            duckSpeed: 460,
        };
        this.lastTime = null;
    };

    componentDidMount() {
        this.initGameState(); // Initialize physics state
        this.isComponentMounted = true;
        this.setupEventListeners();
        this.loadCarImages();

        this.increaseDifficultyInterval = setInterval(this.increaseDifficulty, 30000);

        if (this.canvasRef.current) {
            this.canvasRef.current.addEventListener('click', this.handleCanvasClick);
            this.canvasRef.current.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            this.canvasRef.current.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        }
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
        document.removeEventListener("keydown", this.keyDownHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
        cancelAnimationFrame(this.animationFrameId);
        clearInterval(this.increaseDifficultyInterval);

        if (this.canvasRef.current) {
            this.canvasRef.current.removeEventListener('click', this.handleCanvasClick);
            this.canvasRef.current.removeEventListener('touchstart', this.handleTouchStart);
            this.canvasRef.current.removeEventListener('touchend', this.handleTouchEnd);
        }
    }

    loadCarImages = () => {
        const carImages = {
            redCar: redCarImage,
            greenCar: greenCarImage,
            orangeCar: orangeCarImage,
            blueCar: blueCarImage,
        };

        const imagePromises = Object.entries(carImages).map(([key, src]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ key, img });
                img.onerror = reject;
                img.src = src;
            });
        });

        Promise.all(imagePromises)
            .then(results => {
                const loadedCarImages = results.reduce((acc, { key, img }) => {
                    acc[key] = img;
                    return acc;
                }, {});

                this.setState({ carImages: loadedCarImages }, this.setObstacles);
            })
            .catch(error => {
                console.error('Error loading images:', error);
                // Handle image loading error (e.g., show an error message or retry loading)
            });
    };

    setupEventListeners = () => {
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    };

    handleCanvasClick = (event) => {
        const rect = this.canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Adjusted coordinates for the "Play Again" button
        if (this.state.gameOver &&
            x > this.canvasRef.current.width / 2 - 75 &&
            x < this.canvasRef.current.width / 2 + 75 &&
            y > this.canvasRef.current.height - 40 && // Adjusted for bottom left corner
            y < this.canvasRef.current.height) { // Adjusted for bottom left corner
            this.restartGame();
        }
    };

    handleTouchStart = (e) => {
        if (this.state.gameOver && this.canvasRef.current) {
            const rect = this.canvasRef.current.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            if (x > this.canvasRef.current.width / 2 - 75 &&
                x < this.canvasRef.current.width / 2 + 75 &&
                y > this.canvasRef.current.height - 40 &&
                y < this.canvasRef.current.height) {
                this.restartGame();
                return;
            }
        }

        if (e.cancelable) {
            e.preventDefault();
        }

        if (this.canvasRef.current) {
            const rect = this.canvasRef.current.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const width = rect.width;

            if (x < width / 2) {
                this.gameState.leftPressed = true;
                this.gameState.rightPressed = false;
            } else {
                this.gameState.leftPressed = false;
                this.gameState.rightPressed = true;
            }
        }
    };

    handleTouchEnd = (e) => {
        if (e.cancelable) {
            e.preventDefault();
        }
        this.gameState.leftPressed = false;
        this.gameState.rightPressed = false;
    };

    keyDownHandler = (e) => {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.gameState.rightPressed = true;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.gameState.leftPressed = true;
        }
    };

    keyUpHandler = (e) => {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.gameState.rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.gameState.leftPressed = false;
        }
    };

    startGame = () => {
        // Always restart the game if the "Try Again" button is clicked
        if (this.state.gameOver) {
            this.restartGame();
        } else {
            this.setState({
                startSequenceFinished: true,
                showStartComponent: true,
                gameOver: false, // Ensure the game is not marked as over when starting
                isGameActive: true
            }, () => {
                if (this.props.onGameStateChange) {
                    this.props.onGameStateChange({ isGameActive: true, isGameOver: false });
                }
            });
        }
    };

    restartGame = () => {
        // Stop any running intervals first to be safe
        clearInterval(this.increaseDifficultyInterval);
        cancelAnimationFrame(this.animationFrameId);

        this.initGameState(); // Reset physics state

        // Reset UI state
        const initialState = this.getInitialState();
        this.setState({
            ...initialState,
            startImageLoaded: true,
            explosionImage: this.state.explosionImage || this.explosionImg // Preserve the loaded image
        }, () => {
            this.setupEventListeners();
            this.loadCarImages(); // This might trigger a setState, which is fine
            this.startGame();
            this.draw(); // Force a draw to clear "Game Over" text immediately
        });
    };

    gameOver = () => {
        cancelAnimationFrame(this.animationFrameId);
        clearInterval(this.increaseDifficultyInterval);

        this.setState({
            gameOver: true,
        }, () => {
            // Redraw the canvas to show the game over state immediately
            this.draw();
            if (this.props.onGameStateChange) {
                this.props.onGameStateChange({ isGameActive: false, isGameOver: true });
            }
        });
    };

    handleSequenceEnd = () => {
        // Hide the start component and start the game loop
        this.setState({ startSequenceFinished: true, showStartComponent: false }, () => {
            this.setupEventListeners();
            this.loadCarImages();

            // Start physics/timers NOW
            clearInterval(this.increaseDifficultyInterval);
            this.increaseDifficultyInterval = setInterval(this.increaseDifficulty, 30000);
            this.gameLoop();
        });
    };

    draw = () => {
        const canvas = this.canvasRef.current;
        if (!canvas || !this.state.startImageLoaded) return; // Check if canvas exists and image is loaded

        const ctx = canvas.getContext('2d');
        ctx.save();

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        if (!this.state.startSequenceFinished) {
            // Fill the canvas with a black background
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate the aspect ratio of the image
            const imageAspectRatio = this.startImg.width / this.startImg.height;
            // Calculate the dimensions to fit the canvas while maintaining aspect ratio
            let drawWidth = canvas.width;
            let drawHeight = drawWidth / imageAspectRatio;
            if (drawHeight > canvas.height) {
                drawHeight = canvas.height;
                drawWidth = drawHeight * imageAspectRatio;
            }
            // Calculate the position to center the image
            const x = (canvas.width - drawWidth) / 2;
            const y = (canvas.height - drawHeight) / 2;
            // Draw the resized and centered image
            ctx.drawImage(this.startImg, x, y, drawWidth, drawHeight);
        } else {
            this.drawRoad(ctx);

            this.drawDuck(ctx);
            this.drawCurbs(ctx);

            // Draw Score
            ctx.font = '24px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(`Score: ${this.gameState.score}`, SCORE_POSITION.x, SCORE_POSITION.y);
        }

        if (!this.state.gameOver) {
            this.drawObstacles(ctx);
        } else {
            this.handleGameOver(ctx);
        }

        ctx.restore(); // Restore the context state to what it was before the save()
    };

    drawRoad = (ctx) => {
        // Use hardcoded dimensions for robustness
        const canvasWidth = GAME_WIDTH;
        const canvasHeight = GAME_HEIGHT;
        const roadWidth = ROAD_WIDTH;
        const roadStart = ROAD_START;
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

    drawDuck = (ctx) => {
        const { duckX } = this.gameState;
        const canvas = this.canvasRef.current;
        const duckWidth = 50;
        const duckHeight = 50;
        const duckY = (canvas.height - duckHeight) / 1.25;
        ctx.drawImage(this.duck, duckX, duckY, duckWidth, duckHeight);
    };

    drawObstacles = (ctx) => {
        const { obstacles } = this.gameState;
        const { carImages } = this.state;
        obstacles.forEach(obstacle => {
            const img = carImages[obstacle.image];
            if (img) {
                ctx.drawImage(img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    };

    drawCurbs = (ctx) => {
        const { curbOffset } = this.gameState;
        // Use hardcoded dimensions
        const roadWidth = ROAD_WIDTH;
        const roadStart = ROAD_START;
        const curbWidth = 10;
        const curbHeight = 20;

        for (let y = curbOffset - curbHeight; y < GAME_HEIGHT; y += curbHeight * 2) {
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

    handleGameOver = (ctx) => {
        // Draw explosion if there was a collision
        const collidedObstacle = this.gameState.collidedObstacleIndex !== null
            ? this.gameState.obstacles[this.gameState.collidedObstacleIndex]
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

        // Draw the "Game Over" text
        ctx.font = '48px serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', this.canvasRef.current.width / 2, this.canvasRef.current.height / 2);
    };

    setObstacles = () => {
        const roadWidth = 800 / 2;
        const roadStart = (800 - roadWidth) / 2;
        // Directly set gameState obstacles
        this.gameState.obstacles = [
            { image: 'redCar', x: roadStart + roadWidth / 3 - 25, y: -50, width: 50, height: 50 },
            { image: 'blueCar', x: roadStart + roadWidth / 3, y: -250, width: 50, height: 50 },
            { image: 'orangeCar', x: roadStart + roadWidth - 50, y: -650, width: 50, height: 50 },
            { image: 'greenCar', x: roadStart + roadWidth / 3 * 2, y: -450, width: 50, height: 50 },
        ];
    };

    gameLoop = (timestamp) => {
        if (!this.state.gameOver && this.isComponentMounted) {
            if (!this.lastTime) this.lastTime = timestamp;
            const deltaTime = (timestamp - this.lastTime) / 1000; // Convert ms to seconds
            this.lastTime = timestamp;

            // Cap dt to prevent spiraling if tab was inactive (max 0.1s frame)
            const dt = Math.min(deltaTime, 0.1);

            this.update(dt);
            this.draw();
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    };

    update = (dt) => {
        this.moveDuck(dt);
        this.updateObstacles(dt);
        this.updateCurbs(dt);
        this.checkCollisions();
    };

    increaseDifficulty = () => {
        // Direct modification of gameState
        this.gameState.difficultyLevel += 1;
        // Increase speed by 30px/s
        this.gameState.obstacleSpeed += 30;
    };

    moveDuck = (dt) => {
        const { duckX, rightPressed, leftPressed, duckSpeed } = this.gameState;
        // Use hardcoded dimensions
        const roadStart = ROAD_START;
        const duckWidth = 54;
        const roadEnd = ROAD_END - duckWidth;

        if (rightPressed && duckX < roadEnd) {
            this.gameState.duckX += duckSpeed * dt;
        } else if (leftPressed && duckX > roadStart) {
            this.gameState.duckX -= duckSpeed * dt;
        }
    };

    updateCurbs = (dt) => {
        // Half the obstacle speed for the curb scrolling speed
        const curbSpeed = this.gameState.obstacleSpeed * 2;
        const { curbOffset } = this.gameState;

        let nextOffset = (curbOffset + (curbSpeed * dt)) % (20 * 2);

        // Safety guard for NaN or undefined which can happen on tab switch/mobile suspend
        if (isNaN(nextOffset)) {
            nextOffset = 0;
        }

        this.gameState.curbOffset = nextOffset;
    };

    updateObstacles = (dt) => {
        const { obstacles, obstacleSpeed } = this.gameState;
        // Use hardcoded dimensions
        const roadStart = ROAD_START;
        const roadEnd = ROAD_END;
        const obstacleWidth = 50;

        let scoreIncrement = 0;

        // Mutate obstacles in place to avoid Garbage Collection
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            // Y = Y + (Speed * dt)
            obstacle.y += obstacleSpeed * dt;

            obstacle.y += obstacleSpeed * dt;

            if (obstacle.y > GAME_HEIGHT) {
                obstacle.y = -obstacle.height;
                // Randomize X position
                obstacle.x = roadStart + Math.random() * (roadEnd - roadStart - obstacleWidth);
                scoreIncrement++;
            }
        }

        this.gameState.score += scoreIncrement;
    };

    checkCollisions = () => {
        const { duckX, obstacles } = this.gameState;
        const duckWidth = 50;
        const duckHeight = 50;
        const canvas = this.canvasRef.current;
        const duckY = (canvas.height - duckHeight) / 1.25;

        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];

            if (duckX < obstacle.x + obstacle.width &&
                duckX + duckWidth > obstacle.x &&
                duckY < obstacle.y + obstacle.height &&
                duckY + duckHeight > obstacle.y) {

                this.gameState.collidedObstacleIndex = i;
                this.gameOver();
                return; // Stop checking
            }
        }
    };

    render() {
        const { gameOver } = this.state;

        const startComponentStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10 // Ensure it's above the canvas
        };

        return (
            <div className="game-container">
                <canvas
                    ref={this.canvasRef}
                    width="800"
                    height="600"
                    style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        // Box shadow removed for performance
                    }}
                />

                {!gameOver && this.state.startSequenceFinished && !this.state.showStartComponent && (
                    <>
                        <div className="mobile-controls-arrow left">
                            <Icon name='chevron left' />
                        </div>
                        <div className="mobile-controls-arrow right">
                            <Icon name='chevron right' />
                        </div>
                    </>
                )}

                {/* StartComponent should show only during the start sequence */}
                {this.state.showStartComponent && (
                    <div style={startComponentStyle}>
                        <StartComponent onSequenceEnd={this.handleSequenceEnd} />
                    </div>
                )}
            </div>
        );
    }
}

export default DuckGame;
