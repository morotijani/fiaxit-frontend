import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsonGet } from '../../helpers/Ajax';
import { AuthContext } from '../../contexts/AuthContext';

function AdminDashboard() {
    const [authStore] = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const resp = await jsonGet('admin/stats');
                if (resp && resp.success) {
                    setStats(resp.data);
                }
            } catch (err) {
                console.error("Stats error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    const summary = stats?.summary || {};

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-5">
                {/* display ser profile if it exist else display default icon */}
                {authStore.user?.user_profile ? (
                    <img src={authStore.user?.user_profile} alt="Profile" className="rounded-circle" style={{ width: '80px', height: '80px' }} />
                ) : (
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center border mb-3" style={{ width: '80px', height: '80px' }}>
                        <span className="material-symbols-outlined text-muted" style={{ fontSize: '40px' }}>account_circle</span>
                    </div>
                )}

                <h1 className="fw-normal" style={{ fontSize: '1.75rem', color: '#202124' }}>Welcome, {authStore.user?.user_fname}</h1>
                <p className="text-muted">Manage your platform statistics, users, and security settings.</p>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-6">
                    <div className="admin-card h-100">
                        <div className="d-flex align-items-start mb-4">
                            <div className="flex-grow-1">
                                <h3 className="admin-card-title">User Analytics</h3>
                                <p className="admin-card-text">Monitor growth and verification status of your user base.</p>
                            </div>
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>people</span>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <div className="p-3 bg-light rounded-2 border">
                                    <div className="small text-muted mb-1 text-uppercase fw-medium" style={{ fontSize: '10px' }}>Total Registered</div>
                                    <div className="fs-4 fw-medium">{summary.totalUsers || 0}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded-2 border">
                                    <div className="small text-muted mb-1 text-uppercase fw-medium" style={{ fontSize: '10px' }}>Verified (KYC)</div>
                                    <div className="fs-4 fw-medium">{summary.verifiedUsers || 0}</div>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => navigate('/admin/users')} className="btn btn-link p-0 text-primary text-decoration-none fw-medium d-flex align-items-center">
                            Manage users <span className="material-symbols-outlined ms-1" style={{ fontSize: '18px' }}>chevron_right</span>
                        </button>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="admin-card h-100">
                        <div className="d-flex align-items-start mb-4">
                            <div className="flex-grow-1">
                                <h3 className="admin-card-title">Security & Verification</h3>
                                <p className="admin-card-text">Review and approve pending identity documents.</p>
                            </div>
                            <span className="material-symbols-outlined text-warning" style={{ fontSize: '24px' }}>verified_user</span>
                        </div>

                        <div className="d-flex align-items-center p-3 bg-light rounded-2 border mb-4">
                            <div className="flex-grow-1">
                                <div className="small text-muted mb-1 text-uppercase fw-medium" style={{ fontSize: '10px' }}>Pending Approvals</div>
                                <div className="fs-4 fw-medium">{summary.pendingKyc || 0}</div>
                            </div>
                            <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-circle">
                                <span className="material-symbols-outlined">notification_important</span>
                            </div>
                        </div>

                        <button onClick={() => navigate('/admin/kyc')} className="btn btn-link p-0 text-primary text-decoration-none fw-medium d-flex align-items-center">
                            Review documents <span className="material-symbols-outlined ms-1" style={{ fontSize: '18px' }}>chevron_right</span>
                        </button>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="admin-card h-100">
                        <div className="d-flex align-items-start mb-4">
                            <div className="flex-grow-1">
                                <h3 className="admin-card-title">Financial Flow</h3>
                                <p className="admin-card-text">Track all crypto movements and transaction status.</p>
                            </div>
                            <span className="material-symbols-outlined text-info" style={{ fontSize: '24px' }}>payments</span>
                        </div>

                        <div className="d-flex align-items-center p-3 bg-light rounded-2 border mb-4">
                            <div className="flex-grow-1">
                                <div className="small text-muted mb-1 text-uppercase fw-medium" style={{ fontSize: '10px' }}>Total Transactions</div>
                                <div className="fs-4 fw-medium">{summary.totalTransactions || 0}</div>
                            </div>
                        </div>

                        <button onClick={() => navigate('/admin/transactions')} className="btn btn-link p-0 text-primary text-decoration-none fw-medium d-flex align-items-center">
                            View history <span className="material-symbols-outlined ms-1" style={{ fontSize: '18px' }}>chevron_right</span>
                        </button>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="admin-card h-100">
                        <div className="d-flex align-items-start mb-4">
                            <div className="flex-grow-1">
                                <h3 className="admin-card-title">Platform Assets</h3>
                                <p className="admin-card-text">Configure supported currencies and active tokens.</p>
                            </div>
                            <span className="material-symbols-outlined text-success" style={{ fontSize: '24px' }}>toll</span>
                        </div>

                        <div className="bg-light p-3 rounded-2 border mb-4 text-center">
                            <p className="small text-muted mb-0">Manage system-wide coin availability and configurations.</p>
                        </div>

                        <button onClick={() => navigate('/admin/coins')} className="btn btn-link p-0 text-primary text-decoration-none fw-medium d-flex align-items-center">
                            Manage assets <span className="material-symbols-outlined ms-1" style={{ fontSize: '18px' }}>chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="admin-card p-0 overflow-hidden">
                <div className="d-flex align-items-center justify-content-between p-4 px-md-5 border-bottom">
                    <h3 className="admin-card-title mb-0">Recent Activity</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 admin-table">
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th className="px-4 px-md-5 py-3">User</th>
                                <th className="py-3">Type</th>
                                <th className="py-3">Amount</th>
                                <th className="py-3">Status</th>
                                <th className="py-3 text-end px-4 px-md-5">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentTransactions?.map(tx => (
                                <tr key={tx.transaction_id}>
                                    <td className="px-4 px-md-5 py-3">
                                        <div className="fw-medium">{tx.sender?.user_fname} {tx.sender?.user_lname}</div>
                                        <small className="text-muted">{tx.sender?.user_email}</small>
                                    </td>
                                    <td className="py-3">
                                        <span className={`badge rounded-pill fw-normal px-3 py-1 bg-light text-dark border`}>
                                            {tx.transaction_type?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="fw-medium">{parseFloat(tx.transaction_amount).toFixed(4)} {tx.transaction_crypto_symbol}</div>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center">
                                            <div className={`rounded-circle me-2`} style={{ width: '8px', height: '8px', backgroundColor: tx.transaction_status === 'Completed' ? '#1e8e3e' : tx.transaction_status === 'Pending' ? '#f9ab00' : '#d93025' }}></div>
                                            <span className="small">{tx.transaction_status}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-end px-4 px-md-5 text-muted small">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
