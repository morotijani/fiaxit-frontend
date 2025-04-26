import React, { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainNav from './components/MainNav';
import { AuthContext } from './contexts/AuthContext';
import { TodoContext } from './contexts/TodoContext';
import Todos from './components/todos/Todos'
import Contacts from './components/contacts/Contacts'
import ContactForm from './components/contacts/ContactForm'
import { ContactContext } from './contexts/ContactContext'
import { jsonGet } from './helpers/Ajax'

function AppIndex() {

    const navigate = useNavigate();
    const  [authStore, authDispatch] = useContext(AuthContext);
    const [todoStore, todoDispatch] = useContext(TodoContext)
    const [contactStore, contactDispatch] = useContext(ContactContext)

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
        // get all todos from db
        const resp = await jsonGet('todos') 
        if (resp.success) {
            todoDispatch({type: 'setTodos', payload: {todos: resp.data, total: resp.total}})
        }
        // get all contacts
        const contactResp = await jsonGet('contacts');
        if (contactResp.success) {
            contactDispatch({type: 'setContacts', payload: {contacts: contactResp.data, total: contactResp.total}});
        }
    }

    return (
        <main className="app">
            <MainNav />
            <div className="main-content">
                <Routes>
                    <Route path="/contacts/:id" element={<ContactForm />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/" element={<Todos />} />
                </Routes>
            </div>
            
        </main>
    );
}

export default AppIndex;