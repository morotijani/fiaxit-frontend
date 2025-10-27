import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';

function AuthIndex() {
    return (
        <div>
            <Routes>
                    <Route exact path="login" element={<Login />} />
                    <Route excat path="signup" element={<SignUp />} />
                </Routes>
        </div>
    )
}

export default AuthIndex;