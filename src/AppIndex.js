import { useContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MainFooter from './components/MainFooter';
import { AuthContext } from './contexts/AuthContext';
import Main from './components/main/Main'

import Todos from './components/todos/Todos'
import { TodoContext } from './contexts/TodoContext';

import Crypto from './components/crypto/Crypto'
import { CoinContext } from './contexts/CoinContext';

import Receive from './components/trade/Receive'
import SendCrypto from './components/trade/Send'
import ReceiveAsset from './components/trade/ReceiveAsset'
import Staking from './components/trade/Staking'
import Withdraw from './components/trade/Withdraw'

import Transactions from './components/transactions/Transactions'
import { TransactionContext } from './contexts/TransactionContext'

import Wallets from './components/wallets/Wallets'
import WalletDetails from './components/wallets/WalletDetails'
import { WalletContext } from './contexts/WalletContext'

import Contacts from './components/contacts/Contacts'
import ContactForm from './components/contacts/ContactForm'
import { ContactContext } from './contexts/ContactContext'

import Profile from './components/profile/Profile'
import KYCSubmit from './components/profile/KYCSubmit'
import SettingsForm from './components/profile/SettingsForm'
import ChangePassword from './components/profile/ChangePassword'
import ChangePIN from './components/profile/ChangePIN'
import TwoFactorSettings from './components/profile/TwoFactorSettings'
import WhitelistingSettings from './components/profile/WhitelistingSettings'
import SessionsSettings from './components/profile/SessionsSettings'
import AntiPhishingSettings from './components/profile/AntiPhishingSettings'
import PriceAlerts from './components/profile/PriceAlerts'
import AddCoin from './components/admin/AddCoin'
import Notifications from './components/notifications/Notifications'
import Converter from './components/converter/Converter'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminUsers from './components/admin/AdminUsers'
import AdminKYC from './components/admin/AdminKYC'
import AdminTransactions from './components/admin/AdminTransactions'
import AdminCoins from './components/admin/AdminCoins'
import AdminProfile from './components/admin/AdminProfile'
import AdminSecurity from './components/admin/AdminSecurity'
import AdminSettings from './components/admin/AdminSettings'

import { jsonGet } from './helpers/Ajax'
import Preloader from './components/Preloader'


function AppIndex() {

    const navigate = useNavigate();
    const [authStore, authDispatch] = useContext(AuthContext);
    const [coinStore, coinDispatch] = useContext(CoinContext)
    const [, todoDispatch] = useContext(TodoContext)
    const [, contactDispatch] = useContext(ContactContext)
    const [, transactionDispatch] = useContext(TransactionContext)
    const [, walletDispatch] = useContext(WalletContext)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // run startup sequence
        (async function startup() {
            try {
                // trigger auth check in store
                await authDispatch({ type: "isLoggedIn" });
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
            todoDispatch({ type: 'setTodos', payload: { todos: resp.data, total: resp.total } })
        }

        // get all contacts
        const contactResp = await jsonGet('contacts');
        if (contactResp && contactResp.success) {
            contactDispatch({ type: 'setContacts', payload: { contacts: contactResp.data, total: contactResp.total } });
        }

        // get all transactions
        const transactionResp = await jsonGet('transactions');
        if (transactionResp && transactionResp.success) {
            transactionDispatch({ type: 'setTransactions', payload: { transactions: transactionResp.data, total: transactionResp.total } });
            console.log('Transactions loaded:', transactionResp.data);
        }

        // get all wallets
        const walletResp = await jsonGet('wallets');
        if (walletResp && walletResp.success) {
            walletDispatch({ type: 'setWallets', payload: { wallets: walletResp.data, total: walletResp.total, rates: walletResp.rates } });
            console.log('Wallets loaded:', walletResp.data);
        }

        // get all coins
        const coinResp = await jsonGet('coins');
        if (coinResp && coinResp.success) {
            coinDispatch({ type: 'setCoins', payload: { coins: coinResp.data, total: coinResp.total } });
            console.log('Coins loaded:', coinResp.data);
        }
    }

    if (loading) {
        return <Preloader />;
    }

    const { pathname } = useLocation();
    const isAdminRoute = pathname.startsWith('/admin');
    const userIsAdmin = authStore.user && authStore.user.user_role === 'admin';

    // If it's an admin route, we provide a full-screen experience
    if (isAdminRoute && userIsAdmin) {
        return (
            <div className="admin-wrapper animate-fade-in vh-100 vw-100 overflow-hidden bg-light">
                <AdminLayout>
                    <Routes>
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/kyc" element={<AdminKYC />} />
                        <Route path="/admin/transactions" element={<AdminTransactions />} />
                        <Route path="/admin/coins" element={<AdminCoins />} />
                        <Route path="/admin/profile" element={<AdminProfile />} />
                        <Route path="/admin/security" element={<AdminSecurity />} />
                        <Route path="/admin/settings" element={<AdminSettings />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </AdminLayout>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-center align-items-center bg-light main-card">
                <div className="card shadow-lg border-0 p-0 main-card-container">
                    <div className="flex-grow-1 overflow-auto main-page-scroll">
                        <Routes>
                            <Route path="/trade/receive/:id" element={<ReceiveAsset />} />
                            <Route path="/trade/receive" element={<Receive />} />
                            <Route path="/receive-asset" element={<ReceiveAsset />} />
                            <Route path="/receive" element={<Receive />} />
                            <Route path="/trade/send" element={<SendCrypto />} />
                            <Route path="/send" element={<SendCrypto />} />
                            <Route path="/staking" element={<Staking />} />
                            <Route path="/withdraw" element={<Withdraw />} />
                            <Route path="/crypto/:id" element={<Crypto />} />
                            <Route path="/wallet/:id" element={<WalletDetails />} />
                            <Route path="/wallets" element={<Wallets />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/settings" element={<SettingsForm />} />
                            <Route path="/trade/swap" element={<Converter />} />
                            <Route path="/converter" element={<Converter />} />
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="/change-pin" element={<ChangePIN />} />
                            <Route path="/two-factor" element={<TwoFactorSettings />} />
                            <Route path="/whitelisting" element={<WhitelistingSettings />} />
                            <Route path="/sessions" element={<SessionsSettings />} />
                            <Route path="/anti-phishing" element={<AntiPhishingSettings />} />
                            <Route path="/price-alerts" element={<PriceAlerts />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/kyc-submit" element={<KYCSubmit />} />
                            <Route path="/contacts/:id" element={<ContactForm />} />
                            <Route path="/contacts" element={<Contacts />} />
                            <Route path="/todos" element={<Todos />} />
                            <Route path="/admin/add-coin" element={<AddCoin />} />
                            <Route path="/" element={<Main />} />
                        </Routes>
                    </div>
                    <MainFooter />
                </div>
            </div>
        </div>
    );
}

export default AppIndex;
