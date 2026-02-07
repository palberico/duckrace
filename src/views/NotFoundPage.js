import React from 'react';
import { Link } from 'react-router-dom';
import DuckGame from '../components/DuckGame';
import { Button, ButtonGroup, ButtonOr } from 'semantic-ui-react';
import '../NotFoundPage.css';

const NotFoundPage = ({
    header = "404 - Page Not Found",
    message = "Sorry, the page you are looking for does not exist. But hey, enjoy this game while you're here!"
}) => {
    const duckGameRef = React.useRef(null);
    const [gameState, setGameState] = React.useState({
        isGameActive: false,
        isGameOver: false
    });

    const handleGameStateChange = (newState) => {
        setGameState(prevState => ({ ...prevState, ...newState }));
    };

    const handleStartRace = () => {
        if (duckGameRef.current) {
            if (gameState.isGameOver) {
                // To be safe and simple, we can reload or try to reset. 
                // The game component has a restartGame method.
                if (typeof duckGameRef.current.restartGame === 'function') {
                    duckGameRef.current.restartGame();
                } else {
                    // Fallback if method not found (though it should be)
                    window.location.reload();
                }
            } else {
                if (typeof duckGameRef.current.startGame === 'function') {
                    duckGameRef.current.startGame();
                }
            }
        }
    };

    return (
        <div className="not-found-page">
            <div className="content">
                <h1>{header}</h1>
                <p>{message}</p>
                <ButtonGroup>
                    <Button color='red' onClick={handleStartRace}>
                        {gameState.isGameOver ? 'Race Again' : (gameState.isGameActive ? 'Racing...' : 'Start Race')}
                    </Button>
                    <ButtonOr />
                    <Button as={Link} to='/' basic color='yellow'>Back to Home</Button>
                </ButtonGroup>
            </div>
            <DuckGame ref={duckGameRef} onGameStateChange={handleGameStateChange} />
            <div className="footer">
                <p>© 2024 RaceDucks.com. All rights reserved.</p>
                <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>Keep on quackin'.</p>
            </div>
        </div>
    );
};

export default NotFoundPage;
