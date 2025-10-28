import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TransactionContext } from '../../contexts/TransactionContext'
import { jsonDelete } from '../../helpers/Ajax'
import Button from '../elements/Button'
import toast from 'react-hot-toast';

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

    const transactions = [
    {
      type: "Send",
      crypto: "BTC",
      amount: "-0.0034 BTC",
      time: "2 hrs ago",
      status: "Completed",
    },
    {
      type: "Receive",
      crypto: "ETH",
      amount: "+0.56 ETH",
      time: "Yesterday",
      status: "Pending",
    },
    {
      type: "Send",
      crypto: "USDT",
      amount: "-120 USDT",
      time: "Oct 10, 2025",
      status: "Completed",
    },
    {
      type: "Receive",
      crypto: "BNB",
      amount: "+0.78 BNB",
      time: "Oct 9, 2025",
      status: "Failed",
    },
  ];

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-success";
      case "Pending":
        return "text-warning";
      case "Failed":
        return "text-danger";
      default:
        return "text-muted";
    }
  };

    const transactionList = transactionStore.transactions.map((transaction, index) => {
        return ( 
            <tr key={index}>
                {transaction}
            </tr>
        )
    })

    return (
         <div>
            <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#eaeae6"}}>
                {/* back button */}
                <button className="btn btn-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">keyboard_backspace</span>
                </button>
                <h5 className="m-0">Transactions History</h5>
                <button className="btn btn-sm" onClick={() => navigate("/notifications")}>
                    <span class="material-symbols-outlined">siren</span>
                </button>
            </div>
            <div className="p-4">
                {/* Header */}
                <div className="text-center mb-2">
                    <h6 className="">Transactions</h6>
                    <p className="text-muted small mb-0">Your recent activity</p>
                </div>

                {/* Transaction List */}
                <div className="flex-grow-1 overflow-auto">
                    {transactions.map((tx, index) => (
                        <div
                        key={index}
                        className="d-flex justify-content-between align-items-center border-bottom py-3"
                        >
                        <div className="d-flex align-items-center">
                            <div
                            className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                tx.type === "Send" ? "bg-danger-subtle" : "bg-success-subtle"
                            }`}
                            style={{ width: 40, height: 40 }}
                            >
                            {tx.type === "Send" ? (
                                <span className="material-symbols-outlined text-success">arrow_upward</span>
                            ) : (
                                <span class="material-symbols-outlined text-danger">arrow_downward</span>
                            )}
                            </div>
                            <div>
                            <div className="fw-semibold">{tx.crypto}</div>
                            <div className="text-muted small">{tx.time}</div>
                            </div>
                        </div>
                        <div className="text-end">
                            <div
                            className={`fw-semibold ${
                                tx.type === "Send" ? "text-danger" : "text-success"
                            }`}
                            >
                            {tx.amount}
                            </div>
                            <div className={`small ${statusColor(tx.status)}`}>
                            {tx.status}
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Transactions;