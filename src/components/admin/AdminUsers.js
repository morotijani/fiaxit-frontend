import React, { useState, useEffect } from 'react';
import { jsonGet } from '../../helpers/Ajax';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const resp = await jsonGet(`admin/users?page=${page}&search=${search}`);
            if (resp && resp.success) {
                setUsers(resp.data);
                setTotalPages(resp.pages);
            }
        } catch (err) {
            console.error("Fetch users error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeout);
    }, [page, search]);

    return (
        <div className="animate-fade-in">
            <div className="mb-4">
                <h2 className="fw-normal" style={{ color: '#202124' }}>People & access</h2>
                <p className="text-muted small">Information about people on your platform, including their role and verification status.</p>
            </div>

            <div className="admin-card p-0 overflow-hidden mb-4">
                <div className="p-4 border-bottom bg-light bg-opacity-10">
                    <div className="input-group border rounded-2 bg-white" style={{ maxWidth: '400px' }}>
                        <span className="input-group-text bg-transparent border-0 pe-0">
                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>search</span>
                        </span>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none ps-2 py-2"
                            placeholder="Search by name or email"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 admin-table">
                        <thead>
                            <tr>
                                <th className="px-4 py-3">User info</th>
                                <th className="py-3">Role</th>
                                <th className="py-3">Security status</th>
                                <th className="py-3">Joined</th>
                                <th className="py-3 text-end px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.user_id}>
                                    <td className="px-4 py-3">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle me-3 d-flex align-items-center justify-content-center border" style={{ width: '32px', height: '32px' }}>
                                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>account_circle</span>
                                            </div>
                                            <div>
                                                <div className="fw-medium text-dark">{u.user_fname} {u.user_lname}</div>
                                                <div className="text-muted small">{u.user_email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`small fw-medium ${u.user_role === 'admin' ? 'text-danger' : 'text-primary'}`}>
                                            {u.user_role === 'admin' ? 'Administrator' : 'Standard User'}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center">
                                            <span className={`material-symbols-outlined me-2 ${u.kyc_status === 'verified' ? 'text-success' : 'text-warning'}`} style={{ fontSize: '18px' }}>
                                                {u.kyc_status === 'verified' ? 'verified_user' : 'gpp_maybe'}
                                            </span>
                                            <span className="small text-muted text-capitalize">{u.kyc_status}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-muted small">
                                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="py-3 text-end px-4">
                                        <button className="btn btn-sm btn-link text-primary text-decoration-none fw-medium">Manage</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">No users found match your search criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-3 border-top d-flex justify-content-center bg-light bg-opacity-10">
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 bg-transparent text-primary" onClick={() => setPage(page - 1)}>
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                        <button
                                            className={`page-link border-0 mx-1 rounded-circle ${page === i + 1 ? 'bg-primary text-white' : 'bg-transparent text-dark'}`}
                                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => setPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 bg-transparent text-primary" onClick={() => setPage(page + 1)}>
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUsers;
