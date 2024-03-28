import React, { Component } from 'react';
import duckImage from '../assets/images/DuckGame.png'; // Import the duck image

class DuckGame extends Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef(); // Create a ref for the canvas

        const roadWidth = 800 / 3; // Assuming canvas width is 800
        const roadStart = (800 - roadWidth) / 2;

        // Create an off-screen canvas for double buffering
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 800;
        this.offscreenCanvas.height = 600;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        const curbHeight = 30; // Example curb height
        const numCurbs = Math.ceil(600 / curbHeight); // Calculate the number of curbs needed based on the canvas height

        // Initialize the curbs array with positions to create a scrolling effect
        const curbs = Array.from({ length: numCurbs }, (_, i) => ({
            y: -curbHeight + i * curbHeight * 2, // positioning the curbs with the correct spacing
            height: curbHeight, // set the height for each curb
        }));

        this.state = {
            duckX: roadStart + (roadWidth - 150) / 2, // Centering the duck
            rightPressed: false,
            leftPressed: false,
            // ... other initial state ...
            curbs, // Add the curb state here
        };

        this.duck = new Image(); // Create a new Image object for the duck
        this.duck.src = duckImage; // Set the source of the duck image
    }

    componentDidMount() {
        this.updateCanvas();
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
        this.gameInterval = setInterval(() => this.draw(), 10);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyDownHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
        clearInterval(this.gameInterval);
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
        const roadWidth = canvas.width / 3;
        const roadStart = (canvas.width - roadWidth) / 2;
        const roadEnd = roadStart + roadWidth - 150; // Subtract the width of the duck
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

    moveDuck = () => {
        const { duckX, rightPressed, leftPressed } = this.state;
        const canvas = this.canvasRef.current;
        const roadWidth = canvas.width / 2;
        const roadStart = (canvas.width - roadWidth) / 2;
        const roadEnd = roadStart + roadWidth - 150; // Subtract the width of the duck
        if (rightPressed && duckX < roadEnd) {
            this.setState({ duckX: duckX + 7 });
        } else if (leftPressed && duckX > roadStart) {
            this.setState({ duckX: duckX - 7 });
        }
    };

    drawObstacles = (ctx) => {
        const { obstacles } = this.state;
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    };

    updateObstacles = () => {
        const { obstacles } = this.state;
        const roadWidth = this.canvasRef.current.width / 2; // Road takes up half the canvas width
        const roadStart = (this.canvasRef.current.width - roadWidth) / 2;
        const updatedObstacles = obstacles.map(obstacle => {
            let newY = obstacle.y + 2; // Move the obstacle down
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

    drawCurbs = (ctx, roadStart, roadWidth) => {
        const { curbs } = this.state;
        const curbWidth = 10; // Width of the curb stripe
        curbs.forEach(curb => {
          // Draw left curb stripe
          ctx.fillStyle = (curb.y / curb.height) % 2 === 0 ? 'red' : 'white';
          ctx.fillRect(roadStart - curbWidth, curb.y, curbWidth, curb.height);
      
          // Draw right curb stripe
          ctx.fillStyle = (curb.y / curb.height) % 2 === 0 ? 'red' : 'white';
          ctx.fillRect(roadStart + roadWidth, curb.y, curbWidth, curb.height);
        });
      };

      updateCurbs = () => {
        const canvasHeight = this.canvasRef.current.height;
        const speed = 2; // Speed of movement, match with the obstacle speed
        this.setState(prevState => ({
          curbs: prevState.curbs.map(curb => {
            let newY = curb.y + speed; // Use the same speed variable as obstacles
            if (newY > canvasHeight) {
              newY = -curb.height; // Reset to just above the canvas
            }
            return {
              ...curb,
              y: newY,
            };
          }),
        }));
    };



    drawDuck = (ctx) => {
        const { duckX } = this.state;
        ctx.drawImage(this.duck, duckX, ctx.canvas.height - 100, 100, 100); // Draw the duck image
    };

    draw = () => {
        const roadWidth = this.offscreenCanvas.width / 2;
        const roadStart = (this.offscreenCanvas.width - roadWidth) / 2;

        // Perform all drawing operations on the off-screen canvas
        this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        this.drawRoad(this.offscreenCtx);
        this.drawCurbs(this.offscreenCtx, roadStart, roadWidth);
        this.drawObstacles(this.offscreenCtx);
        this.drawDuck(this.offscreenCtx);

        // Copy the off-screen canvas to the on-screen canvas
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.drawImage(this.offscreenCanvas, 0, 0);

        // Update the positions of obstacles and curbs
        this.moveDuck();
        this.updateObstacles();
        this.updateCurbs(); // Update the curbs for scrolling
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
