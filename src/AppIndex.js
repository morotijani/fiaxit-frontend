import React, { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainNav from './components/MainNav';
import { AuthContext } from './contexts/AuthContext';
import { TodoContext } from './contexts/TodoContext';
import Todos from './components/todos/Todos'
import { jsonGet } from './helpers/Ajax'

function AppIndex() {

    const navigate = useNavigate();
    const  [authStore, authDispatch] = useContext(AuthContext);
    const [todoStore, todoDispatch] = useContext()

    useEffect(() => {
        authCheck();
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []); // passing empty [] means, it will only run just one time it is rendered

    async function authCheck() {
        await authDispatch({type: "isLoggedIn"});
        if (!authStore.loggedIn) {
            navigate('/auth/login');
        } else {
            hydrate(); // load everything from db into our store
        }
        return authStore.loggedIn;
    }

    async function hydrate() {
        const resp = await jsonGet('todos') // get all todos from db
        if (resp.success) {
            todoDispatch({type: 'setTodos', payload: {todos: resp.data, total: resp.total}})
        }
    }

    return (
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