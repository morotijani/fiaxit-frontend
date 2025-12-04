import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import SignUpComplete from './SignUpComplete'
import VerifyEmail from './VerifyEmail'
import Logout from './Logout';

function AuthIndex() {
    return (
        <div>
            <Routes>
                <Route exact path="logout" element={<Logout />} />
                <Route exact path="login" element={<Login />} />
                <Route exact path="signup" element={<SignUp />} />
                <Route exact path="registered/:id" element={<SignUpComplete />} />
                <Route exact path="verify/:id/:code" element={<VerifyEmail />} />
            </Routes>
        </div>
    )
}

export default AuthIndex;