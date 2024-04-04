import React from 'react';
import { Link } from 'react-router-dom';
import DuckGame from '../components/DuckGame';
import { Button, ButtonGroup, ButtonOr } from 'semantic-ui-react';
import '../NotFoundPage.css';

const NotFoundPage = () => {
    return (
        <div className="not-found-page">
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist. But hey, enjoy this game while you're here!</p>
            <Link to="/">
                <ButtonGroup color='red'>
                    <ButtonOr />
                        <Button>Back to Home</Button>
                </ButtonGroup>
            </Link>
            <DuckGame />
        </div>
    );
};

export default NotFoundPage;
