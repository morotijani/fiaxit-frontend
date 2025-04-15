import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';

function AuthIndex() {
    return (
        <main className="auth-layout">
            <div className="poster">
                <Routes>
                    <Route exact path="login" element={<Login />} />
                    <Route excat paht="signup" element={<Signup />} />
                </Routes>
            </div>
        </main>
    )
}

export default AuthIndex;