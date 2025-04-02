import React from 'react'
import { Link, useHistory } from 'react-router-dom'

function MainNav(props) {
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
                    Hi Alhaji
                </div>
                <button className="right" onclick={() => window.alert("log out")}>Logout</button>
            </section>
        </nav>
    )
}

export default MainNav