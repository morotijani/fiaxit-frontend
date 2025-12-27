// ThemeToggle.js
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Switch } from 'antd'

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className="d-flex align-items-center">
            <span className={`material-symbols-outlined me-2 ${theme === 'light' ? 'text-warning' : 'text-muted'}`} style={{ fontSize: '18px' }}>
                light_mode
            </span>
            <Switch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                size="small"
                className={theme === 'dark' ? 'bg-primary' : ''}
            />
            <span className={`material-symbols-outlined ms-2 ${theme === 'dark' ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '18px' }}>
                dark_mode
            </span>
        </div>
    );
};

export default ThemeToggle;