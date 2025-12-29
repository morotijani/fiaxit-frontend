import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

function AdminLayout({ children }) {
    const [authStore, authDispatch] = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        authDispatch({ type: 'logout' });
        navigate('/auth/login');
    };

    return (
        <div className="d-flex h-100 admin-wrapper">
            {/* Sidebar */}
            <aside className="admin-sidebar d-none d-md-flex flex-column">
                <div className="admin-header border-bottom-0 mb-2">
                    <span className="logo-text fw-medium">Fiaxit Admin</span>
                </div>

                <div className="nav flex-column mt-2">
                    <NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">dashboard</span>
                        Home
                    </NavLink>

                    <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">people</span>
                        Users
                    </NavLink>

                    <NavLink to="/admin/kyc" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">verified_user</span>
                        Security & KYC
                    </NavLink>

                    <NavLink to="/admin/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">payments</span>
                        Payments
                    </NavLink>

                    <NavLink to="/admin/coins" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">toll</span>
                        Assets
                    </NavLink>

                    <div className="mt-4 pt-4 border-top mx-4">
                        <button onClick={handleLogout} className="nav-link text-danger border-0 bg-transparent w-100 d-flex align-items-center">
                            <span className="material-symbols-outlined">logout</span>
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow-1 overflow-auto">
                {/* Header */}
                <header className="admin-header">
                    <div className="d-md-none">
                        <span className="logo-text fw-medium">Fiaxit</span>
                    </div>
                    <div className="ms-auto d-flex align-items-center">
                        <div className="text-end me-3 d-none d-sm-block">
                            <div className="fw-medium small" style={{ color: '#202124' }}>{authStore.user?.user_fname} {authStore.user?.user_lname}</div>
                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>Admin Console</small>
                        </div>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '38px', height: '38px', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>account_circle</span>
                        </div>
                    </div>
                </header>

                <main className="p-4 p-md-5 mx-auto" style={{ maxWidth: '1200px' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
