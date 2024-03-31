import React, { Component } from 'react';
import StartComponent from './StartComponent';
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

    // Load the duck image
    this.duck = new Image();
    this.duck.src = duckImage;

    // Load the explosion image
    this.explosionImg = new Image();
    this.explosionImg.src = explosionImage;

    // Optional: Use onload to confirm the image has loaded
    this.explosionImg.onload = () => {
        if (this.isComponentMounted) {
            this.setState({ explosionImage: this.explosionImg });
        }
    };
    }

    startGame = () => {
        // Hide the start button and begin the start sequence
        this.setState({
            startSequenceFinished: true,
            showStartComponent: true
        });
    };
      
    

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
        startSequenceFinished: false,
        showStartComponent: false,
        score: 0,
    });

    componentDidMount() {
        this.isComponentMounted = true;
        this.setupEventListeners();
        this.loadCarImages();
        this.increaseDifficultyInterval = setInterval(this.increaseDifficulty, 30000);
    
        if (this.canvasRef.current) {
            this.canvasRef.current.addEventListener('click', this.handleCanvasClick);
        }
    }
    
    handleCanvasClick = (event) => {
        const rect = this.canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        // Adjusted coordinates for the "Play Again" button
        if (this.state.gameOver &&
            x > this.canvasRef.current.width / 2 - 75 &&
            x < this.canvasRef.current.width / 2 + 75 &&
            y > this.canvasRef.current.height / 2 - 20 && // Adjusted for vertical alignment
            y < this.canvasRef.current.height / 2 + 20) { // Adjusted for vertical alignment
            this.restartGame();
        }
    };

    setupEventListeners = () => {
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    };

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

    setObstacles = () => {
        const roadWidth = 800 / 2; // Assuming the road takes up half the canvas width
        const roadStart = (800 - roadWidth) / 2;
      
        const obstacles = [
            { image: 'redCar', x: roadStart + roadWidth / 3 - 25, y: -50, width: 50, height: 50 },
            { image: 'blueCar', x: roadStart + roadWidth / 3, y: -250, width: 50, height: 50 },
            { image: 'orangeCar', x: roadStart + roadWidth - 50, y: -650, width: 50, height: 50 },
            { image: 'greenCar', x: roadStart + roadWidth / 3 * 2, y: -450, width: 50, height: 50 },
        ];
        this.setState({ obstacles });
    };

    componentWillUnmount() {
        this.isComponentMounted = false;
        document.removeEventListener("keydown", this.keyDownHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
        cancelAnimationFrame(this.animationFrameId);
        clearInterval(this.increaseDifficultyInterval);
    
        if (this.canvasRef.current) {
            this.canvasRef.current.removeEventListener('click', this.handleCanvasClick);
        }
    }

    gameLoop = () => {
        if (!this.state.gameOver && this.isComponentMounted) {
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
        const { obstacles, obstacleSpeed, score } = this.state;
        const canvas = this.canvasRef.current;
        const roadWidth = canvas.width / 2;
        const roadStart = (canvas.width - roadWidth) / 2;
        const roadEnd = roadStart + roadWidth;
        const obstacleWidth = 50; // The width of your obstacles
        
        let scoreIncrement = 0;
        const updatedObstacles = obstacles.map(obstacle => {
          let newY = obstacle.y + obstacleSpeed;
          if (newY > canvas.height) {
            newY = -obstacle.height;
            const newPosX = roadStart + Math.random() * (roadEnd - roadStart - obstacleWidth);
            scoreIncrement++; // Increment score for dodging the obstacle
            return { ...obstacle, y: newY, x: newPosX };
          }
          return { ...obstacle, y: newY };
        });
      
        this.setState({
          obstacles: updatedObstacles,
          score: score + scoreIncrement // Update the score state
        });
      };

      draw = () => {
        const canvas = this.canvasRef.current;
        if (!canvas) return; // Early return if canvas is not available
    
        const ctx = canvas.getContext('2d');
    
        ctx.save(); // Save the current context state
    
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transform matrix to the identity matrix
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    
        this.drawRoad(ctx);
        this.drawDuck(ctx);
        this.drawCurbs(ctx);
    
        console.log(`Drawing score at x: ${SCORE_POSITION.x}, y: ${SCORE_POSITION.y}`);
        console.log(`Canvas size is width: ${canvas.width}, height: ${canvas.height}`);
    
        // Draw Score
        ctx.font = '24px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`Score: ${this.state.score}`, SCORE_POSITION.x, SCORE_POSITION.y);
    
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
    
        ctx.restore(); // Restore the context state to what it was before the save()
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
    // Reset the state to its initial values and restart the game loop
    this.setState({
        ...this.getInitialState(),
        startSequenceFinished: true, // Ensure the start sequence is marked as finished
        showStartComponent: false, // Ensure the start component is hidden
        score: 0, // Reset score
        gameOver: false, // Reset the game over state
    }, () => {
        this.setupEventListeners();
        this.loadCarImages();
        this.gameLoop();
    });
};

render() {
    const { startSequenceFinished, gameOver, showStartComponent } = this.state;

    const startButtonStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 20 // Ensure button is above everything else
    };
  
    const startComponentStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10 // Ensure it's above the canvas but below the start button
    };
  
    return (
        <div className="game-container" style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto' }}>
          <canvas ref={this.canvasRef} width="800" height="600" style={{ border: '1px solid black' }} />
          
          {/* Button should show when game hasn't started or has ended */}
          {!startSequenceFinished && !gameOver && (
            <button onClick={this.startGame} style={startButtonStyle}>
              Start Game
            </button>
          )}
          
          {/* StartComponent should show only during the start sequence */}
          {showStartComponent && (
            <div style={startComponentStyle}>
              <StartComponent onSequenceEnd={this.handleSequenceEnd} />
            </div>
          )}
        </div>
    );
}
  
  handleSequenceEnd = () => {
    // Hide the start component and start the game loop
    this.setState({ startSequenceFinished: true, showStartComponent: false }, () => {
      this.setupEventListeners();
      this.loadCarImages();
      this.gameLoop();
    });
  };
}

export default DuckGame;
