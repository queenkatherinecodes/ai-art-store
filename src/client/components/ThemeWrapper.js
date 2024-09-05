import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';

function ThemeWrapper({ children }) {
    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
}

export default ThemeWrapper;