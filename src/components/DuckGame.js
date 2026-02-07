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
        carImages: {}, // Keep images in state or instance? State is fine as it's one-time load.
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
            obstacleSpeed: 2,
            difficultyLevel: 1,
            collidedObstacleIndex: null,
            score: 0,
            curbs: [],
        };
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

    // ... (componentWillUnmount remains same)

    // ... (loadCarImages remains same, uses setState for images which is fine)

    // key handlers update instance vars now
    handleTouchStart = (e) => {
        if (this.state.gameOver && this.canvasRef.current) {
            // ... (gameOver click logic remains same)
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
        if (this.state.gameOver) {
            this.restartGame();
        } else {
            this.setState({
                startSequenceFinished: true,
                showStartComponent: true,
                gameOver: false,
                isGameActive: true
            }, () => {
                if (this.props.onGameStateChange) {
                    this.props.onGameStateChange({ isGameActive: true, isGameOver: false });
                }
            });
        }
    };

    restartGame = () => {
        clearInterval(this.increaseDifficultyInterval);
        cancelAnimationFrame(this.animationFrameId);

        this.initGameState(); // Reset physics state

        // Reset UI state
        const initialState = this.getInitialState();
        this.setState({
            ...initialState,
            startImageLoaded: true,
            explosionImage: this.state.explosionImage || this.explosionImg
        }, () => {
            this.setupEventListeners();
            this.loadCarImages(); // This might trigger a setState, which is fine
            this.startGame();
            this.draw();
        });
    };

    gameOver = () => {
        cancelAnimationFrame(this.animationFrameId);
        clearInterval(this.increaseDifficultyInterval);

        this.setState({
            gameOver: true,
        }, () => {
            this.draw();
            if (this.props.onGameStateChange) {
                this.props.onGameStateChange({ isGameActive: false, isGameOver: true });
            }
        });
    };

    // ... handleSequenceEnd remains same

    draw = () => {
        const canvas = this.canvasRef.current;
        if (!canvas || !this.state.startImageLoaded) return;

        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!this.state.startSequenceFinished) {
            // ... (start image drawing logic remains same)
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const imageAspectRatio = this.startImg.width / this.startImg.height;
            let drawWidth = canvas.width;
            let drawHeight = drawWidth / imageAspectRatio;
            if (drawHeight > canvas.height) {
                drawHeight = canvas.height;
                drawWidth = drawHeight * imageAspectRatio;
            }
            const x = (canvas.width - drawWidth) / 2;
            const y = (canvas.height - drawHeight) / 2;
            ctx.drawImage(this.startImg, x, y, drawWidth, drawHeight);
        } else {
            this.drawRoad(ctx);
            this.drawDuck(ctx);
            this.drawCurbs(ctx);

            // Draw Score from gameState
            ctx.font = '24px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(`Score: ${this.gameState.score}`, SCORE_POSITION.x, SCORE_POSITION.y);
        }

        if (!this.state.gameOver) {
            this.checkCollisions();
            this.drawObstacles(ctx);
            this.moveDuck();
            this.updateObstacles();
            this.updateCurbs();
        } else {
            this.handleGameOver(ctx);
        }

        ctx.restore();
    };

    // ... drawRoad remains same

    drawDuck = (ctx) => {
        const { duckX } = this.gameState; // Use gameState
        const canvas = this.canvasRef.current;
        const duckWidth = 50;
        const duckHeight = 50;
        const duckY = (canvas.height - duckHeight) / 1.25;
        ctx.drawImage(this.duck, duckX, duckY, duckWidth, duckHeight);
    };

    drawObstacles = (ctx) => {
        const { obstacles } = this.gameState; // Use gameState
        const { carImages } = this.state; // Images still in state
        obstacles.forEach(obstacle => {
            const img = carImages[obstacle.image];
            if (img) {
                ctx.drawImage(img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    };

    drawCurbs = (ctx) => {
        const { curbOffset } = this.gameState; // Use gameState
        const roadWidth = ctx.canvas.width / 2;
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

    handleGameOver = (ctx) => {
        // ... (game over drawing uses gameState for collision index)
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

    increaseDifficulty = () => {
        // Direct modification of gameState
        this.gameState.difficultyLevel += 1;
        this.gameState.obstacleSpeed += 1;
    };

    moveDuck = () => {
        const { duckX, rightPressed, leftPressed } = this.gameState;
        const canvas = this.canvasRef.current;
        const roadWidth = canvas.width / 2;
        const roadStart = (canvas.width - roadWidth) / 2;
        const duckWidth = 54;
        const roadEnd = roadStart + roadWidth - duckWidth;

        if (rightPressed && duckX < roadEnd) {
            this.gameState.duckX += 7;
        } else if (leftPressed && duckX > roadStart) {
            this.gameState.duckX -= 7;
        }
    };

    updateCurbs = () => {
        const curbSpeed = this.gameState.obstacleSpeed * 2;
        const { curbOffset } = this.gameState;
        this.gameState.curbOffset = (curbOffset + curbSpeed) % (20 * 2);
    };

    updateObstacles = () => {
        const { obstacles, obstacleSpeed, score } = this.gameState;
        const canvas = this.canvasRef.current;
        const roadWidth = canvas.width / 2;
        const roadStart = (canvas.width - roadWidth) / 2;
        const roadEnd = roadStart + roadWidth;
        const obstacleWidth = 50;

        let scoreIncrement = 0;
        const updatedObstacles = obstacles.map(obstacle => {
            let newY = obstacle.y + obstacleSpeed;
            if (newY > canvas.height) {
                newY = -obstacle.height;
                const newPosX = roadStart + Math.random() * (roadEnd - roadStart - obstacleWidth);
                scoreIncrement++;
                return { ...obstacle, y: newY, x: newPosX };
            }
            return { ...obstacle, y: newY };
        });

        this.gameState.obstacles = updatedObstacles;
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
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
                    }}
                />

                {/* Touch Indicators - Verify if user is on mobile or always show? 
                    For now, showing always as hints is helpful. 
                    Can condition on window.innerWidth later if needed.
                */}
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
