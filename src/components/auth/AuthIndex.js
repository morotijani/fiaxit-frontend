import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';

function AuthIndex() {
    return (
        <main className="auth-layout">
            <div className="poster">
                <Routes>
                    <Route exact path="login" element={<Login />} />
                    <Route excat path="signup" element={<SignUp />} />
                </Routes>
            </div>
        </main>
    )
}

export default AuthIndex;