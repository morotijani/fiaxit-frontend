import React, { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainNav from './components/MainNav';
import { AuthContext } from './contexts/AuthContext';
import Todos from './components/todos/Todos'

function AppIndex() {

    const navigate = useNavigate();
    const  [authStore, authDispatch] = useContext(AuthContext);

    useEffect(() => {
        authCheck();
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []); // passing empty [] means, it will only run just one time it is rendered

    async function authCheck() {
        await authDispatch({type: "isLoggedIn"});
        if (!authStore.loggedIn) {
            navigate('/auth/login');
        }
        return authStore.loggedIn;
    }

    return(
        <main className="app">
            <MainNav />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Todos />} />
                </Routes>               
            </div>
            
        </main>
    );
}

export default AppIndex;