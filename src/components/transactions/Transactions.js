import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TransactionContext } from '../../contexts/TransactionContext'
import { AuthContext } from '../../contexts/AuthContext'
import { jsonDelete } from '../../helpers/Ajax'
import Button from '../elements/Button'
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

function Transactions() {
    const navigate = useNavigate();
    const [authStore, authDispatch] = useContext(AuthContext);
    const [transactionStore, transactionDispatch] = useContext(TransactionContext);

    async function handleContactDelete(id) {
        if (window.confirm("Are you siure you want to delete this contact?  This cannot be undone !")) {
            const resp = await jsonDelete(`contacts/${id}`)
            if (resp.success) {
                transactionDispatch({ type: 'contactDeleted', payload: id });
                toast.success("Contacted deleted !", { duration: 6000 })
            } else {
                toast.failed("Something went wrong please try again !", { duration: 6000 })
            }
        }
    }

    const statusColor = (status) => {
        if (!status) return "text-muted";
        const s = String(status).toLowerCase();
        switch (s) {
            case "completed":
            case "complete":
                return "text-success";
            case "pending":
                return "text-warning";
            case "failed":
            case "error":
                return "text-danger";
            default:
                return "text-muted";
        }
    };

    function timeAgo(date) {
        if (!date) return '';
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch (e) {
            return '';
        }
    }

    // Render placeholders when loading
    const renderPlaceholder = (key) => (
        <div key={key} className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
            <div className="d-flex align-items-center">
                <div className="rounded-circle bg-light me-3 placeholder-glow" style={{ width: 44, height: 44 }}>
                    <div className="placeholder w-100 h-100 rounded-circle"></div>
                </div>
                <div style={{ minWidth: '100px' }}>
                    <div className="fw-bold placeholder-glow mb-1">
                        <span className="placeholder col-8"></span>
                    </div>
                    <div className="small placeholder-glow">
                        <span className="placeholder col-6"></span>
                    </div>
                </div>
            </div>
            <div className="text-end" style={{ minWidth: '80px' }}>
                <div className="fw-bold placeholder-glow mb-1">
                    <span className="placeholder col-10"></span>
                </div>
                <div className="small placeholder-glow">
                    <span className="placeholder col-6"></span>
                </div>
            </div>
        </div>
    );

    const txsArray = Array.isArray(transactionStore?.transactions) ? transactionStore.transactions : [];

    const transactionList = transactionStore?.loading
        ? Array.from({ length: 6 }).map((_, i) => renderPlaceholder(`ph-${i}`))
        : txsArray.map((tx, index) => {
            // Handle null or undefined transactions
            if (!tx) return null;

            // check if tx is 0
            if (tx === 0) {
                return (
                    <div key={`alert-${index}`} className="alert alert-primary" role="alert">
                        No transactions found.
                    </div>
                )
            }

            const tFrom = tx.transaction_by ?? '';
            const tTo = tx.transaction_to ?? '';
            // Use both common ID patterns for maximum compatibility
            const currentUserId = authStore.user?.user_id || authStore.user?.id;
            const type = tTo === currentUserId ? "Receive" : tFrom === currentUserId ? "Send" : tx.transaction_type ?? 'Unknown';

            const amountNum = Number(tx.transaction_amount ?? tx.amount ?? tx.value ?? 0) || 0;
            const amountSign = type === "Send" ? "-" : type === "Receive" ? "+" : "";
            const formattedAmount = `${amountSign}${Math.abs(amountNum).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 })} ${tx.transaction_crypto_symbol ?? ''}`;

            const createdAt = tx.createdAt ?? tx.created_at ?? tx.timestamp ?? tx.time ?? null;
            const displayTime = timeAgo(createdAt);

            const statusText = tx.transaction_status ?? tx.status ?? 'Unknown';
            const statusClass = statusColor(statusText);

            const isSend = String(type).toLowerCase() === 'send';
            const iconClass = isSend ? 'arrow_upward' : 'arrow_downward';
            const iconColorClass = isSend ? 'text-danger' : 'text-success';

            const key = tx.id ?? tx._id ?? index;

            return (
                <div
                    key={key}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-0 border-bottom"
                >
                    <div className="d-flex align-items-center">
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm ${isSend ? "bg-danger-subtle" : "bg-success-subtle"}`}
                            style={{ width: 44, height: 44, border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            <span className={`material-symbols-outlined ${iconColorClass}`} style={{ fontSize: '20px' }}>{iconClass}</span>
                        </div>
                        <div>
                            <div className="fw-bold">{tx.transaction_crypto_symbol ?? tx.crypto_symbol ?? '—'}</div>
                            <div className="text-muted small d-flex align-items-center">
                                <span className={`badge ${isSend ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} me-2`} style={{ fontSize: '0.65rem' }}>
                                    {type}
                                </span>
                                {displayTime}
                            </div>
                        </div>
                    </div>
                    <div className="text-end">
                        <div className={`fw-bold ${isSend ? "text-danger" : "text-success"}`} style={{ letterSpacing: '-0.5px' }}>
                            {formattedAmount}
                        </div>
                        <div className={`small fw-semibold mt-1 px-2 py-0 border rounded-pill d-inline-block ${statusClass}`} style={{ fontSize: '0.7rem' }}>
                            {statusText}
                        </div>
                    </div>
                </div>
            )
        });

    return (
        <div className="animate-fade-in">
            {/* Top Handle for App-like feel */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header / Top Bar */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Transaction History</h6>
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate("/notifications")}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>notifications</span>
                </button>
            </div>

            <div className="p-4">
                {/* Statistics Header */}
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-2 shadow-sm" style={{ width: '64px', height: '64px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>history</span>
                    </div>
                    <h5 className="fw-bold mb-1">Total Activities</h5>
                    <div className="badge rounded-pill bg-light text-dark shadow-sm border px-3 py-2">
                        {transactionStore?.total ?? 0} Transactions
                    </div>
                    <p className="text-muted small mt-2">Your recent crypto activity on the network</p>
                </div>

                {/* Transaction List */}
                <div className="list-group rounded-4 border shadow-sm overflow-hidden mb-5">
                    {transactionList.length > 0 ? transactionList : (
                        <div className="p-5 text-center bg-light">
                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>receipt_long</span>
                            <p className="text-muted mt-2">No transaction data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Transactions;