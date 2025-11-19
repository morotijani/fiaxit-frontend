import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import Logout from './Logout';

function AuthIndex() {
    return (
        <div>
            <Routes>
                <Route exact path="logout" element={<Logout />} />
                <Route exact path="login" element={<Login />} />
                <Route exact path="signup" element={<SignUp />} />
            </Routes>
        </div>
    )
}

export default AuthIndex;