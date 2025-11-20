import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TransactionContext } from '../../contexts/TransactionContext'
import { jsonDelete } from '../../helpers/Ajax'
import Button from '../elements/Button'
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

function Transactions() {
    const navigate = useNavigate();
    const [transactionStore, transactionDispatch] = useContext(TransactionContext);

    async function handleContactDelete(id) {
        if (window.confirm("Are you siure you want to delete this contact?  This cannot be undone !")) {
            const resp = await jsonDelete(`contacts/${id}`)
            if (resp.success) {
                transactionDispatch({type: 'contactDeleted', payload: id});
                toast.success("Contacted deleted !", {duration :6000})
            } else {
                toast.failed("Something went wrong please try again !", {duration :6000})
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
        <div key={key} className="d-flex justify-content-between align-items-center border-bottom py-3">
            <div className="d-flex align-items-center">
                <div className="rounded-circle bg-secondary-subtle me-3" style={{ width: 40, height: 40 }}></div>
                <div>
                    <div className="fw-semibold placeholder-glow">
                        <span className="placeholder col-6"></span>
                    </div>
                </div>
            </div>
            <div className="text-end">
                <div className="fw-semibold placeholder-glow">
                    <span className="placeholder col-4"></span>
                </div>
                <div className="small placeholder-glow">
                    <span className="placeholder col-3"></span>
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

            const fromAddr = tx.transaction_from_wallet_address ?? tx.from ?? '';
            const toAddr = tx.transaction_to_wallet_address ?? tx.to ?? tx.to_address ?? '';
            const type = fromAddr === toAddr ? "Self" : (tx.transaction_type ?? tx.type ?? 'Unknown');

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
                    className="d-flex justify-content-between align-items-center border-bottom py-3"
                >
                    <div className="d-flex align-items-center">
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${isSend ? "bg-danger-subtle" : "bg-success-subtle"}`}
                            style={{ width: 40, height: 40 }}
                        >
                            <span className={`material-symbols-outlined ${iconColorClass}`}>{iconClass}</span>
                        </div>
                        <div>
                            <div className="fw-semibold">{tx.transaction_crypto_symbol ?? tx.crypto_symbol ?? '—'}</div>
                            <div className="text-muted small">{displayTime}</div>
                        </div>
                    </div>
                    <div className="text-end">
                        <div className={`fw-semibold ${isSend ? "text-danger" : "text-success"}`}>
                            {formattedAmount}
                        </div>
                        <div className={`small ${statusClass}`}>
                            {statusText}
                        </div>
                    </div>
                </div>
            )
        });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#eaeae6" }}>
                {/* back button */}
                <button className="btn btn-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">keyboard_backspace</span>
                </button>
                <h5 className="m-0">Transactions History</h5>
                <button className="btn btn-sm" onClick={() => navigate("/notifications")}>
                    <span className="material-symbols-outlined">siren</span>
                </button>
            </div>
            <div className="p-4">
                {/* Header */}
                <div className="text-center mb-2">
                    <h6 className="">Transactions <span className="badge text-bg-primary">{transactionStore?.total ?? 0}</span></h6>
                    <p className="text-muted small mb-0">Your recent activity</p>
                </div>

                {/* Transaction List */}
                <div className="flex-grow-1 overflow-auto">
                    {transactionList}
                </div>
            </div>
        </div>
    )
}

export default Transactions;