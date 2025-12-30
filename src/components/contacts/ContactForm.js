import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form } from '../../helpers/Form'
import Button from '../elements/Button'
import FieldBlock from '../elements/FieldBlock'
import toast from 'react-hot-toast';
import { jsonGet } from '../../helpers/Ajax'
import { ContactContext } from '../../contexts/ContactContext'
import { CoinContext } from '../../contexts/CoinContext'
import { validateWalletAddress } from '../../helpers/Validators'

function ContactForm() {

    const [, contactDispatch] = useContext(ContactContext)
    const [coinStore] = useContext(CoinContext);
    const navigate = useNavigate();
    let { id } = useParams()
    const [formUrl, setFormUrl] = useState('contacts');
    const [formMethod, setFormMethod] = useState('POST');
    const [fields, setFields] = useState({
        fname: { value: '', isInvalid: false, msg: '' },
        lname: { value: '', isInvalid: false, msg: '' },
        nickname: { value: '', isInvalid: false, msg: '' },
        email: { value: '', isInvalid: false, msg: '' },
        phone: { value: '', isInvalid: false, msg: '' },
        wallet_address: { value: '', isInvalid: false, msg: '' },
        coin_symbol: { value: '', isInvalid: false, msg: '' },
        message: { value: '', isInvalid: false, msg: '' },
    });

    async function fetchContacts() {
        const resp = await jsonGet('contacts')
        if (resp.success) {
            contactDispatch({ type: 'setContacts', payload: { contacts: resp.data, total: resp.total } })
        }
    }

    const success = (resp) => {
        fetchContacts();
        navigate('/contacts');
        toast.success('Contact saved', { duration: 6000 })
    }

    const validateAndSave = (e) => {
        e.preventDefault();
        const address = fields.wallet_address.value;
        const symbol = fields.coin_symbol.value;

        if (address && symbol) {
            const validation = validateWalletAddress(address, symbol);
            if (!validation.isValid) {
                const newFields = { ...fields };
                newFields.wallet_address.isInvalid = true;
                newFields.wallet_address.msg = validation.message;
                setFields(newFields);
                toast.error(validation.message);
                return;
            }
        }

        form.submitForm(e);
    }

    async function fetchContactById(id) {
        const resp = await jsonGet(`contacts/${id}`);
        if (resp.success) {
            form.populateFormValues(resp.contact)
        } else {
            navigate('/contacts');
            toast.success('Contact not found !', { duration: 6000 })
        }
    }

    useEffect(() => {
        if (id === 'new') {
            form.clearFormValues();
            setFormMethod('POST');
            setFormUrl('contacts');
        } else {
            fetchContactById(id);
            setFormMethod('PATCH');
            setFormUrl(`contacts/${id}`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const form = new Form(formUrl, fields, setFields, success, formMethod);

    return (
        <div className="animate-fade-in">
            {/* Top Handle */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass z-3">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate('/contacts')}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">{id === 'new' ? 'New Contact' : 'Edit Contact'}</h6>
                <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm" onClick={validateAndSave}>
                    Save
                </button>
            </div>

            <div className="p-4">
                <div className="bg-white rounded-4 border shadow-sm p-4 mb-4">
                    <h6 className="small fw-bold text-muted text-uppercase mb-4" style={{ letterSpacing: '1px' }}>Personal Info</h6>

                    <div className="row g-3">
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted">First Name</label>
                            <input type="text" id="fname" name="fname" className={`form-control p-3 rounded-4 border-0 bg-light ${fields.fname.isInvalid ? 'is-invalid' : ''}`} placeholder="Kwaku" value={fields.fname.value} onChange={form.handleInputChanges} />
                            {fields.fname.isInvalid && <div className="invalid-feedback">{fields.fname.msg}</div>}
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted">Last Name</label>
                            <input type="text" id="lname" name="lname" className={`form-control p-3 rounded-4 border-0 bg-light ${fields.lname.isInvalid ? 'is-invalid' : ''}`} placeholder="Frimpong" value={fields.lname.value} onChange={form.handleInputChanges} />
                            {fields.lname.isInvalid && <div className="invalid-feedback">{fields.lname.msg}</div>}
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="form-label small fw-bold text-muted">Nickname (Optional)</label>
                        <input type="text" id="nickname" name="nickname" className={`form-control p-3 rounded-4 border-0 bg-light ${fields.nickname.isInvalid ? 'is-invalid' : ''}`} placeholder="Macavali's Savings" value={fields.nickname.value} onChange={form.handleInputChanges} />
                    </div>
                </div>

                <div className="bg-white rounded-4 border shadow-sm p-4 mb-4">
                    <h6 className="small fw-bold text-muted text-uppercase mb-4" style={{ letterSpacing: '1px' }}>Wallet Details</h6>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Select Asset</label>
                        <select
                            id="coin_symbol"
                            name="coin_symbol"
                            className={`form-select p-3 rounded-4 border-0 bg-light ${fields.coin_symbol.isInvalid ? 'is-invalid' : ''}`}
                            value={fields.coin_symbol.value}
                            onChange={form.handleInputChanges}
                        >
                            <option value="">Select a coin</option>
                            {coinStore.coins.map(c => (
                                <option key={c.coin_symbol} value={c.coin_symbol}>{c.coin_name} ({c.coin_symbol})</option>
                            ))}
                        </select>
                        {fields.coin_symbol.isInvalid && <div className="invalid-feedback d-block">{fields.coin_symbol.msg}</div>}
                    </div>

                    <div className="mb-0">
                        <label className="form-label small fw-bold text-muted">Wallet Address</label>
                        <textarea
                            id="wallet_address"
                            name="wallet_address"
                            className={`form-control p-3 rounded-4 border-0 bg-light ${fields.wallet_address.isInvalid ? 'is-invalid' : ''}`}
                            rows="2"
                            placeholder="Paste crypto address here"
                            value={fields.wallet_address.value}
                            onChange={form.handleInputChanges}
                        ></textarea>
                        {fields.wallet_address.isInvalid && <div className="invalid-feedback d-block">{fields.wallet_address.msg}</div>}
                    </div>
                </div>

                <div className="bg-white rounded-4 border shadow-sm p-4">
                    <h6 className="small fw-bold text-muted text-uppercase mb-4" style={{ letterSpacing: '1px' }}>Additional Info</h6>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Email Address</label>
                        <input type="email" id="email" name="email" className={`form-control p-3 rounded-4 border-0 bg-light ${fields.email.isInvalid ? 'is-invalid' : ''}`} placeholder="hamza@example.com" value={fields.email.value} onChange={form.handleInputChanges} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Phone Number</label>
                        <input type="text" id="phone" name="phone" className={`form-control p-3 rounded-4 border-0 bg-light ${fields.phone.isInvalid ? 'is-invalid' : ''}`} placeholder="+233 244 567 8902" value={fields.phone.value} onChange={form.handleInputChanges} />
                    </div>

                    <div className="mb-0">
                        <label className="form-label small fw-bold text-muted">Notes</label>
                        <textarea id="message" name="message" className={`form-control p-3 rounded-4 border-0 bg-light ${fields.message.isInvalid ? 'is-invalid' : ''}`} placeholder="Optional notes about this contact" value={fields.message.value} onChange={form.handleInputChanges}></textarea>
                    </div>
                </div>

                <div className="d-grid mt-4 mb-2">
                    <button className="btn btn-primary py-3 rounded-pill fw-bold shadow-sm" onClick={validateAndSave}>
                        Save Contact
                    </button>
                    <button className="btn btn-link text-muted text-decoration-none mt-2" onClick={() => navigate('/contacts')}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default ContactForm