import React, { Component } from 'react';
import duckImage from '../assets/images/DuckGame.png';
import redCarImage from '../assets/images/RedCar.png';
import blueCarImage from '../assets/images/BlueCar.png';
import greenCarImage from '../assets/images/GreenCar.png';
import orangeCarImage from '../assets/images/OrangeCar.png';

class DuckGame extends Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();

        // Create an off-screen canvas for double buffering
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 800;
        this.offscreenCanvas.height = 600;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        const roadWidth = 800 / 3; // Assuming the full canvas width is 800
        const roadStart = (800 - roadWidth) / 2;

        // const curbHeight = 30; // Example curb height
        // const numCurbs = Math.ceil(this.offscreenCanvas.height / curbHeight); // Calculate the number of curbs needed based on the canvas height

        // Initialize the curbs array with positions to create a scrolling effect
        // const curbs = Array.from({ length: numCurbs }, (_, i) => ({
        //     y: -curbHeight + i * curbHeight * 2, // positioning the curbs with the correct spacing
        //     height: curbHeight, // set the height for each curb
        // }));

        this.state = {
            duckX: roadStart + (roadWidth - 150) / 2,
            rightPressed: false,
            leftPressed: false,
            obstacles: [], // will be populated after images have loaded
            curbs: [], // Initialize curbs here if needed
            curbOffset: 0,
            carImages: { // Add car images to the state
                redCar: null,
                greenCar: null,
                blueCar: null,
                orangeCar: null,
            },
            obstacleSpeed: 2, // Initial speed of obstacles
            difficultyLevel: 1, // Initial difficulty level
        };

        this.duck = new Image();
        this.duck.src = duckImage;
    }

    gameLoop = () => {
        this.draw(); // Perform the game drawing and updates
    
        // Request the next frame
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    componentDidMount() {
        this.updateCanvas();
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
        this.loadCarImages();
        this.gameLoop(); 
        this.increaseDifficultyInterval = setInterval(this.increaseDifficulty, 30000); // Increase difficulty every 30 seconds
    }

    increaseDifficulty = () => {
        this.setState(prevState => ({
            difficultyLevel: prevState.difficultyLevel + 1,
            obstacleSpeed: prevState.obstacleSpeed + 1, // Adjust this value as needed to control the speed increase rate
        }));
    }

    loadCarImages = () => {
        // Create image elements for cars
        const carImages = {
            redCar: new Image(),
            greenCar: new Image(),
            blueCar: new Image(),
            orangeCar: new Image(),
        };

        let loadedImagesCount = 0;
        const totalImages = Object.keys(carImages).length;

        const checkAllImagesLoaded = () => {
            loadedImagesCount++;
            if (loadedImagesCount === totalImages) {
                // All car images are loaded, now we can set the obstacles
                this.setObstacles();
            }
        };

        // Set the src for car images and check if they are all loaded
        carImages.redCar.onload = checkAllImagesLoaded;
        carImages.greenCar.onload = checkAllImagesLoaded;
        carImages.blueCar.onload = checkAllImagesLoaded;
        carImages.orangeCar.onload = checkAllImagesLoaded;

        carImages.redCar.src = redCarImage;
        carImages.greenCar.src = greenCarImage;
        carImages.blueCar.src = blueCarImage;
        carImages.orangeCar.src = orangeCarImage;

        // Update the state with car images
        this.setState({ carImages });
    };

    setObstacles = () => {
        const roadWidth = 800 / 3;
        const roadStart = (800 - roadWidth) / 2;

        // Now that images are loaded, set the obstacles with image references
        const obstacles = [
            { image: this.state.carImages.redCar, x: roadStart + roadWidth / 3 - 25, y: -50, width: 50, height: 50 },
            { image: this.state.carImages.blueCar, x: roadStart + roadWidth / 3 * 2 - 25, y: -150, width: 50, height: 50 },
            { image: this.state.carImages.greenCar, x: roadStart, y: -250, width: 50, height: 50 },
            { image: this.state.carImages.orangeCar, x: roadStart + roadWidth - 75, y: -350, width: 50, height: 50 },
        ];

        this.setState({ obstacles });
    };

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyDownHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
    
        // Cancel the animation frame request
        cancelAnimationFrame(this.animationFrameId);
        clearInterval(this.increaseDifficultyInterval);
    }
    

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
        const canvas = this.canvasRef.current; // Access the canvas element through the ref
        const roadWidth = canvas.width / 2;
        const roadStart = (canvas.width - roadWidth) / 2;
        const duckWidth = 54; // Set this to the new width of your duck image
        const roadEnd = roadStart + roadWidth - duckWidth; 

    if (rightPressed && duckX < roadEnd) {
        this.setState({ duckX: duckX + 7 });
    } else if (leftPressed && duckX > roadStart) {
        this.setState({ duckX: duckX - 7 });
    }
    };

    drawRoad = (ctx) => {
        const roadWidth = ctx.canvas.width / 2; // Road is now half the canvas width
        const roadStart = (ctx.canvas.width - roadWidth) / 2;
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(roadStart, 0, roadWidth, ctx.canvas.height);
    };

    drawObstacles = (ctx) => {
        const { obstacles } = this.state;
        obstacles.forEach(obstacle => {
            if (obstacle.image) {
                ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    };

    updateObstacles = () => {
        const { obstacles, obstacleSpeed } = this.state; // Destructure obstacleSpeed from the state
        const roadWidth = this.canvasRef.current.width / 2; // Road takes up half the canvas width
        const roadStart = (this.canvasRef.current.width - roadWidth) / 2;
    
        const updatedObstacles = obstacles.map(obstacle => {
            let newY = obstacle.y + obstacleSpeed; // Use obstacleSpeed to determine how much each obstacle moves down
    
            // Reset the obstacle to the top once it moves off the screen
            if (newY > this.canvasRef.current.height) {
                newY = -obstacle.height; // Reset to just above the canvas with the obstacle's height
    
                // Randomize the x position within the road for the obstacle to reappear
                // Ensure the entire width of the obstacle is within the road boundaries
                const obstaclePosition = roadStart + (Math.random() * (roadWidth - obstacle.width));
    
                return { ...obstacle, y: newY, x: obstaclePosition };
            }
    
            return { ...obstacle, y: newY };
        });
    
        this.setState({ obstacles: updatedObstacles });
    };
    

//Moving curb code: Save for future use
    // drawCurbs = (ctx, roadStart, roadWidth) => {
    //     const { curbs } = this.state;
    //     const curbWidth = 10; // Width of the curb stripe
    //     curbs.forEach(curb => {
    //         // Draw left curb stripe
    //         ctx.fillStyle = (curb.y / curb.height) % 2 === 0 ? 'red' : 'white';
    //         ctx.fillRect(roadStart - curbWidth, curb.y, curbWidth, curb.height);

    //         // Draw right curb stripe
    //         ctx.fillStyle = (curb.y / curb.height) % 2 === 0 ? 'red' : 'white';
    //         ctx.fillRect(roadStart + roadWidth, curb.y, curbWidth, curb.height);
    //     });
    // };

    updateCurbs = () => {
        const speed = 2; // Speed should match the movement speed of the frame
        this.setState(prevState => ({
            curbOffset: (prevState.curbOffset + speed) % (30 * 2) // Assuming curbHeight is 30, as set in constructor
        }));
    };

drawCurbs = (ctx, roadStart, roadWidth) => {
    const { curbs, curbOffset } = this.state;
    const curbWidth = 10; // Width of the curb stripe
    curbs.forEach(curb => {
      let yPosition = curb.y - curbOffset; // Adjust curb position based on the offset
      // Draw left curb stripe
      ctx.fillStyle = ((yPosition / curb.height) % 2 === 0) ? 'red' : 'white';
      ctx.fillRect(roadStart - curbWidth, yPosition, curbWidth, curb.height);
  
      // Draw right curb stripe
      ctx.fillStyle = ((yPosition / curb.height) % 2 === 0) ? 'red' : 'white';
      ctx.fillRect(roadStart + roadWidth, yPosition, curbWidth, curb.height);
    });
  };

    // drawCurbs = (ctx, roadStart, roadWidth) => {
    //     const { curbs } = this.state;
    //     const curbWidth = 10; // Width of the curb stripe
    //     curbs.forEach(curb => {
    //         // Draw left curb stripe
    //         ctx.fillStyle = (curb.y / curb.height) % 2 === 0 ? 'red' : 'white';
    //         ctx.fillRect(roadStart - curbWidth, curb.y, curbWidth, curb.height);
    
    //         // Draw right curb stripe
    //         ctx.fillStyle = (curb.y / curb.height) % 2 === 0 ? 'red' : 'white';
    //         ctx.fillRect(roadStart + roadWidth, curb.y, curbWidth, curb.height);
    //     });
    // };


    drawDuck = (ctx) => {
        const { duckX } = this.state;
        const canvas = this.canvasRef.current;
        const duckWidth = 50; // The width of your duck image
        const duckHeight = 50; // The height of your duck image
        const duckY = (canvas.height - duckHeight) / 1.25; // Calculate the vertical center using the canvas height
    
        ctx.drawImage(this.duck, duckX, duckY, duckWidth, duckHeight); // Draw the duck centered vertically
    };

    draw = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        const roadWidth = canvas.width / 2;
        const roadStart = (canvas.width - roadWidth) / 2;
        
        // Clear the canvas before each frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw all game elements
        this.drawRoad(ctx);
        this.drawObstacles(ctx);
        this.drawDuck(ctx);
    
        // Update game element positions for next frame
        this.moveDuck();
        this.updateObstacles();
        this.updateCurbs(); // Update the curb offset for scrolling
        this.drawCurbs(ctx, roadStart, roadWidth); // Draw the curbs with updated positions
    };
      

    updateCanvas = () => {
        const canvas = this.canvasRef.current; // Access the canvas element through the ref
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
