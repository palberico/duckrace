import React, { Component } from 'react';

class StartComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentGraphicIndex: 0,
      startGraphics: [
        'start/Start.png',
        'start/Start1.png',
        'start/Start2.png',
        'start/Start3.png',
        'start/Start4.png',
        'start/Start5.png',
        'start/Start.png'
      ],
    };
  }

  componentDidMount() {
    this.startSequence();
  }

  componentWillUnmount() {
    clearInterval(this.interval); // Clear the interval when the component unmounts
  }

  startSequence = () => {
    this.interval = setInterval(() => {
      this.setState(prevState => {
        const nextIndex = prevState.currentGraphicIndex + 1;

        // If we've reached the end of the array
        if (nextIndex === prevState.startGraphics.length) {
          clearInterval(this.interval); // Stop the interval
          this.props.onSequenceEnd(); // Notify parent to start the game
          return { currentGraphicIndex: 0 }; // Optionally reset to first image, or handle differently
        }

        // Move to the next image
        return { currentGraphicIndex: nextIndex };
      });
    }, 1000); // Change the image every 1 second
  };

  render() {
    const { startGraphics, currentGraphicIndex } = this.state;
    // Dynamically import image based on the current index
    const graphicToDisplay = require(`../assets/images/${startGraphics[currentGraphicIndex]}`);

    return (
      <div className="start-sequence">
        <img src={graphicToDisplay} alt="Start Graphic" />
      </div>
    );
  }
}

export default StartComponent;
