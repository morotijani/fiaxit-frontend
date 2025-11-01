import { useContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // optional for JS features (modal, dropdowns, etc.)
import 'bootstrap-icons/font/bootstrap-icons.css'; // bootstrap icons
import 'material-symbols/outlined.css'; // material icons
import MainFooter from './components/MainFooter';
import { AuthContext } from './contexts/AuthContext';
import Main from './components/main/Main'

import Todos from './components/todos/Todos'
import { TodoContext } from './contexts/TodoContext';

import Transactions from './components/transactions/Transactions'
import { TransactionContext } from './contexts/TransactionContext'

import Wallets from './components/wallets/Wallets'
import WalletDetails from './components/wallets/WalletDetails'
import { WalletContext } from './contexts/WalletContext'

import Contacts from './components/contacts/Contacts'
import ContactForm from './components/contacts/ContactForm'
import { ContactContext } from './contexts/ContactContext'

import Profile from './components/profile/Profile'
import SettingsForm from './components/profile/SettingsForm'
import { jsonGet } from './helpers/Ajax'
import Preloader from './components/Preloader'


function AppIndex() {

    const navigate = useNavigate();
    const [authStore, authDispatch] = useContext(AuthContext);
    const [, todoDispatch] = useContext(TodoContext)
    const [, contactDispatch] = useContext(ContactContext)
    const [, transactionDispatch] = useContext(TransactionContext)
    const [, walletDispatch] = useContext(WalletContext)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // run startup sequence
        (async function startup(){
            try {
                // trigger auth check in store
                await authDispatch({type: "isLoggedIn"});
                // simple presence check for token to avoid stale context race
                const token = localStorage.getItem('userJWTToken');
                if (!token && !authStore.loggedIn) {
                    setLoading(false);
                    navigate('/auth/login');
                    return;
                }
                // load app data
                await hydrate();
            } catch (err) {
                console.error('Startup error:', err);
            } finally {
                setLoading(false);
            }
        })();

        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []); // passing empty [] means, it will only run just one time it is rendered

    async function hydrate() {
        // get all todos from db
        const resp = await jsonGet('todos') 
        if (resp && resp.success) {
            todoDispatch({type: 'setTodos', payload: {todos: resp.data, total: resp.total}})
        }

        // get all contacts
        const contactResp = await jsonGet('contacts');
        if (contactResp && contactResp.success) {
            contactDispatch({type: 'setContacts', payload: {contacts: contactResp.data, total: contactResp.total}});
        }

        // get all transactions
        const transactionResp = await jsonGet('transactions');
        if (transactionResp && transactionResp.success) {
            transactionDispatch({type: 'setTransactions', payload: {transactions: transactionResp.data, total: transactionResp.total}});
        }

        // get all wallets
        const walletResp = await jsonGet('wallets');
        if (walletResp && walletResp.success) {
            walletDispatch({type: 'setWallets', payload: {wallets: walletResp.data, total: walletResp.total}});
        }
    }

    if (loading) {
        return <Preloader />;
    }

    return (
        <div className="d-flex justify-content-center align-items-center bg-light main-card">
            <div className="card shadow-sm border-0 p-0 d-flex flex-column main-card-container">
                <div className="flex-grow-1 overflow-auto main-page-scroll">
                    <Routes>
                        <Route path="/wallet/:id" element={<WalletDetails />} />
                        <Route path="/wallets" element={<Wallets />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/settings" element={<SettingsForm />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/contacts/:id" element={<ContactForm />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/todos" element={<Todos />} />
                        <Route path="/" element={<Main />} />
                    </Routes>
                </div>
                <MainFooter />
            </div>
        </div>
    );
}

export default AppIndex;