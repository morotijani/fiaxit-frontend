import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './Login';

function AuthIndex() {
    return (
        <main className="auth-layout">
            <div className="poster">
                <Routes>
                    <Route exact path="login" element={<Login />} />
                </Routes>
            </div>
        </main>
    )
}

export default AuthIndex;