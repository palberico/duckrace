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
        'start/Start.png',
      ],
    };
  }

  componentDidMount() {
    this.startSequence();
  }

  startSequence = () => {
    this.interval = setInterval(() => {
      this.setState(prevState => {
        if (prevState.currentGraphicIndex < prevState.startGraphics.length - 1) {
          return { currentGraphicIndex: prevState.currentGraphicIndex + 1 };
        } else {
          clearInterval(this.interval);
          // Notify parent component (DuckGame) to start the game
          this.props.onSequenceEnd();
          return {};
        }
      });
    }, 1000);
  };

  render() {
    const { startGraphics, currentGraphicIndex } = this.state;
    const graphicToDisplay = require(`../assets/images/${startGraphics[currentGraphicIndex]}`);

    return (
      <div className="start-sequence">
        <img src={graphicToDisplay} alt="Start Graphic" />
      </div>
    );
  }
}

export default StartComponent;
