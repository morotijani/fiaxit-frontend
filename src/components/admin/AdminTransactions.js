import React, { useState, useEffect } from 'react';
import { jsonGet } from '../../helpers/Ajax';

function AdminTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const resp = await jsonGet(`admin/transactions?page=${page}&status=${status}`);
            if (resp && resp.success) {
                setTransactions(resp.data);
                setTotalPages(resp.pages);
            }
        } catch (err) {
            console.error("Fetch transactions error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, status]);

    return (
        <div className="animate-fade-in">
            <div className="mb-4 d-flex align-items-center justify-content-between">
                <div>
                    <h2 className="fw-normal" style={{ color: '#202124' }}>Payments & activity</h2>
                    <p className="text-muted small">A complete history of all financial movements across the platform.</p>
                </div>
                <div className="d-flex align-items-center border rounded-2 px-2 bg-white">
                    <span className="material-symbols-outlined text-muted me-1" style={{ fontSize: '18px' }}>filter_list</span>
                    <select
                        className="form-select border-0 shadow-none small py-1"
                        style={{ width: '150px', fontSize: '0.875rem' }}
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    >
                        <option value="">All statuses</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
            </div>

            <div className="admin-card p-0 overflow-hidden mb-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 admin-table">
                        <thead>
                            <tr>
                                <th className="px-4 py-3">Transaction ID</th>
                                <th className="py-3">Type</th>
                                <th className="py-3">Amount</th>
                                <th className="py-3 text-center">Crypto</th>
                                <th className="py-3">Status</th>
                                <th className="py-3 text-end px-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.transaction_id}>
                                    <td className="px-4 py-3">
                                        <div className="text-primary small fw-medium" style={{ fontFamily: 'monospace' }}>{tx.transaction_id.substring(0, 16)}...</div>
                                        <div className="text-muted" style={{ fontSize: '10px' }}>Ref: {tx.transaction_hash_id?.substring(0, 20)}...</div>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center">
                                            <span className="material-symbols-outlined me-2 opacity-50" style={{ fontSize: '16px' }}>
                                                {tx.transaction_type === 'send' ? 'north_east' : 'south_west'}
                                            </span>
                                            <span className="small text-capitalize">{tx.transaction_type}</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className="fw-medium text-dark">{parseFloat(tx.transaction_amount).toFixed(6)}</span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="badge bg-light text-dark border fw-normal px-2 py-1">{tx.transaction_crypto_symbol}</span>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center">
                                            <div className={`rounded-circle me-2`} style={{ width: '8px', height: '8px', backgroundColor: tx.transaction_status === 'Completed' ? '#1e8e3e' : tx.transaction_status === 'Pending' ? '#f9ab00' : '#d93025' }}></div>
                                            <span className="small text-muted">{tx.transaction_status}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-end px-4 text-muted small">
                                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        <div style={{ fontSize: '10px' }}>{new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">No transactions found matching your filters.</td>
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

export default AdminTransactions;
