// ThemeToggle.js
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Switch } from 'antd'

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div>
            <Switch checked={theme === 'dark'} onChange={toggleTheme} />
        </div>
        
        // <input type="checkbox"
        //     id="custom-switch"
        //     label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        //     checked={theme === 'dark'}
        //     onChange={toggleTheme}
        // />
    );
};

export default ThemeToggle;