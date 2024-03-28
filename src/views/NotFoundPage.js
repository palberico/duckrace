import React from 'react';
import DuckGame from '../components/DuckGame';

const NotFoundPage = () => {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist. But hey, enjoy this game while you're here!</p>
            <DuckGame />
        </div>
    );
};

export default NotFoundPage;
