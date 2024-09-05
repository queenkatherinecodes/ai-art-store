import React from 'react';
import ReactDOM from 'react-dom';
import '../public/styles/global.css';
import App from './App';
import ThemeWrapper from './components/ThemeWrapper';

ReactDOM.render(
    <React.StrictMode>
        <ThemeWrapper>
            <App />
        </ThemeWrapper>
    </React.StrictMode>,
    document.getElementById('root')
);