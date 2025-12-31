import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ContactContext } from '../../contexts/ContactContext'
import { jsonDelete } from '../../helpers/Ajax'
import Button from '../elements/Button'
import toast from 'react-hot-toast';

function Contacts() {

    const [contactStore, contactDispatch] = useContext(ContactContext);

    async function handleContactDelete(id) {
        if (window.confirm("Are you siure you want to delete this contact?  This cannot be undone !")) {
            const resp = await jsonDelete(`contacts/${id}`)
            if (resp.success) {
                contactDispatch({ type: 'contactDeleted', payload: id });
                toast.success("Contacted deleted !", { duration: 6000 })
            } else {
                toast.failed("Something went wrong please try again !", { duration: 6000 })
            }
        }
    }

    const contactList = contactStore.contacts.map((contact, index) => {
        return (
            <div key={index} className="list-group-item p-3 border-0 border-bottom d-flex align-items-center justify-content-between hvr-light">
                <div className="d-flex align-items-center overflow-hidden">
                    <div className="bg-primary-subtle text-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="overflow-hidden">
                        <div className="fw-bold text-dark text-truncate">{contact.nickname || `${contact.fname} ${contact.lname}`}</div>
                        <div className="d-flex align-items-center mt-1">
                            {contact.coin_symbol && (
                                <span className="badge bg-primary-subtle text-primary px-2 py-1 rounded-pill small me-2" style={{ fontSize: '0.65rem' }}>{contact.coin_symbol}</span>
                            )}
                            <div className="text-muted text-truncate small" style={{ fontSize: '0.75rem' }}>{contact.wallet_address || 'No address set'}</div>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center ms-3">
                    <Link className="btn btn-light rounded-circle p-2 shadow-sm me-2 hvr-scale" to={`/trade/send?address=${contact.wallet_address}&symbol=${contact.coin_symbol}`}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>send</span>
                    </Link>
                    <Link className="btn btn-light rounded-circle p-2 shadow-sm me-2 hvr-scale" to={`/contacts/${contact.id}`}>
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>edit</span>
                    </Link>
                    <button className="btn btn-light rounded-circle p-2 shadow-sm hvr-scale text-danger" onClick={() => handleContactDelete(contact.id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                    </button>
                </div>
            </div>
        )
    })

    return (
        <div className="animate-fade-in pb-5">
            {/* Top Handle */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header */}
            <div className="d-flex border-0 justify-content-between align-items-center px-3 py-2 border-bottom sticky-top bg-white glass z-3">
                <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" onClick={() => window.history.back()}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Address Book</h6>
                <Link to='/contacts/new/' className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm">
                    Add
                </Link>
            </div>

            <div className="p-4">
                <div className="bg-white rounded-4 border shadow-sm p-3 mb-4 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-3">
                            <span className="material-symbols-outlined">contact_page</span>
                        </div>
                        <div>
                            <div className="fw-bold">My Recipients</div>
                            <small className="text-muted">Quickly send crypto to your saved addresses.</small>
                        </div>
                    </div>
                </div>

                <h6 className="small fw-bold text-muted text-uppercase mb-3 px-1" style={{ letterSpacing: '1px' }}>Contacts ({contactStore.total ?? 0})</h6>

                {contactList.length > 0 ? (
                    <div className="list-group rounded-4 border shadow-sm overflow-hidden bg-white">
                        {contactList}
                    </div>
                ) : (
                    <div className="text-center p-5 bg-light rounded-4 border border-dashed">
                        <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>person_off</span>
                        <p className="text-muted mt-2">Your address book is empty.</p>
                        <Link to="/contacts/new" className="btn btn-primary rounded-pill px-4 mt-2">Add Contact</Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Contacts;