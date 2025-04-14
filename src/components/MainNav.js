import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

function MainNav(props) {

    const [authStore, authDispatch] = useContext(AuthContext);
    const navigate = useNavigate();

    function logout() {
        authDispatch({type: 'logout'});
        navigate('/auth/login');
    }

    return (
        <nav className='main-nav'>
            <section className="left">
                <h2 className="brand"> Fiaxit</h2>
                <Link to="/">Dashboard</Link>
                <Link to="transactions">Transactions</Link>
                <Link to="profile">My Profile</Link>
                <Link to="wallet">Wallet</Link>
            </section>

            <section className="right">
                <div className="greeting">
                    Hi {authStore.user?.user_fname || 'Stranger'}
                </div>
                <button className="right" onClick={logout}>Logout</button>
            </section>
        </nav>
    )
}

export default MainNav