import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import Button from '../elements/Button'
import { shortenAddress } from '../../helpers/StringHelpers'
import FieldBlock from '../elements/FieldBlock'
import { jsonPost } from '../../helpers/Ajax'
import SelectAsset from './SelectAsset';
import { TransactionContext } from '../../contexts/TransactionContext'
import toast from 'react-hot-toast';

function SendCrypto() {
    const navigate = useNavigate();
    const [authStore] = useContext(AuthContext);
    const [, transactionDispatch] = useContext(TransactionContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState();
    const [showReview, setShowReview] = useState(false);
    const [sending, setSending] = useState(false);

    // Form-like local fields (compatible with your Form helper shape)
    const [fields, setFields] = useState({
        crypto_id: { value: '', isInvalid: false, msg: '' },
        crypto_symbol: { value: '', isInvalid: false, msg: '' },
        crypto_name: { value: '', isInvalid: false, msg: '' },
        crypto_price: { value: '', isInvalid: false, msg: '' }, // USD per 1 crypto
        toAddress: { value: '', isInvalid: false, msg: '' },
        amount: { value: '', isInvalid: false, msg: '' }, // USD amount
        feeRate: { value: '0', isInvalid: false, msg: '' },
        note: { value: '', isInvalid: false, msg: '' },
        privateKey: { value: '', isInvalid: false, msg: '' },
        pin: { value: '', isInvalid: false, msg: '' }
    });

    // helper to update fields similar to Form.handleInputChanges
    const handleFieldChange = (evt) => {
        const key = evt.target.name;
        const value = evt.target.value;
        setFields(prev => {
            const next = { ...prev, [key]: { ...prev[key], value } };
            return next;
        });
    };

    // update hidden crypto meta fields when asset selected
    useEffect(() => {
        if (!selectedAsset) {
            setFields(prev => ({
                ...prev,
                crypto_id: { ...prev.crypto_id, value: '' },
                crypto_symbol: { ...prev.crypto_symbol, value: '' },
                crypto_name: { ...prev.crypto_name, value: '' },
                crypto_price: { ...prev.crypto_price, value: '' }
            }));
            return;
        }
        setFields(prev => ({
            ...prev,
            crypto_id: { ...prev.crypto_id, value: selectedAsset.wallet_id ?? selectedAsset.rawInfo.id ?? '' },
            crypto_symbol: { ...prev.crypto_symbol, value: selectedAsset.symbol ?? '' },
            crypto_name: { ...prev.crypto_name, value: selectedAsset.name ?? selectedAsset.symbol ?? '' },
            crypto_price: { ...prev.crypto_price, value: String(selectedAsset.price ?? 0) }
        }));
    }, [selectedAsset]);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleAssetSelection = (asset) => {
        setSelectedAsset(asset);
        handleCloseModal(); // Close the modal after selection
    };

    const usdAmount = Number(fields.amount.value || 0);
    const pricePerUnit = Number(selectedAsset?.price || 0);
    const cryptoAmount = pricePerUnit > 0 ? (usdAmount / pricePerUnit) : 0;
    const networkFee = 0.0; // replace with real fee calc if available

    function validateBeforeReview() {
        // reset errors
        setFields(prev => {
            const nxt = { ...prev };
            for (const k of Object.keys(nxt)) {
                nxt[k] = { ...nxt[k], isInvalid: false, msg: '' };
            }
            return nxt;
        });

        if (!selectedAsset) {
            toast.error('Please select an asset to send');
            return false;
        }
        if (!usdAmount || isNaN(usdAmount) || usdAmount <= 0) {
            setFields(prev => ({ ...prev, amount: { ...prev.amount, isInvalid: true, msg: 'Enter an amount in USD' } }));
            return false;
        }
        if (!fields.toAddress.value || String(fields.toAddress.value).trim() === '') {
            setFields(prev => ({ ...prev, toAddress: { ...prev.toAddress, isInvalid: true, msg: 'Recipient address required' } }));
            return false;
        }
        if (pricePerUnit <= 0) {
            toast.error('Selected asset has invalid price data');
            return false;
        }
        // optional: check balance if selectedAsset.balance exists (balance is crypto)
        if (typeof selectedAsset?.balance === 'number' && cryptoAmount > selectedAsset.balance + 1e-12) {
            toast.error('Insufficient balance');
            return false;
        }
        return true;
    }

    function validatePin() {
        if (!fields.pin.value || fields.pin.value.length < 4) {
            setFields(prev => ({ ...prev, pin: { ...prev.pin, isInvalid: true, msg: 'Please enter your 4-digit PIN' } }));
            return false;
        }
        return true;
    }

    const handleReview = () => {
        if (!validateBeforeReview()) return;
        setShowReview(true);
    };

    const handleSend = async () => {
        if (!validateBeforeReview()) return;
        if (!validatePin()) return;
        setSending(true);
        try {
            const payload = {
                crypto_id: fields.crypto_id.value,
                crypto_symbol: fields.crypto_symbol.value,
                crypto_name: fields.crypto_name.value,
                crypto_price: Number(fields.crypto_price.value || 0),
                toAddress: fields.toAddress.value,
                amount_usd: Number(fields.amount.value || 0),
                amount: Number(cryptoAmount),
                note: fields.note.value || '',
                feeRate: Number(networkFee),
                pin: fields.pin.value
            };

            const resp = await jsonPost(`trade/${selectedAsset?.symbol.toLowerCase()}/send`, payload, null);
            console.log('payload', resp);
            if (resp && resp.success) {
                if (resp.transaction) {
                    transactionDispatch({ type: 'AddTransaction', payload: resp.transaction });
                }
                toast.success('Transaction initiated successfully', { duration: 6000 });
                navigate(-1);
            } else {
                // Standardize error message extraction (handle Ajax.js wrapper)
                const errorSource = resp?.errors || resp;
                const msg = errorSource?.message || errorSource?.error || 'Send failed';

                // process field errors if present
                if (errorSource?.path && fields[errorSource.path]) {
                    setFields(prev => ({
                        ...prev,
                        [errorSource.path]: { ...prev[errorSource.path], isInvalid: true, msg: msg }
                    }));
                } else if (resp?.errors && Array.isArray(resp.errors)) {
                    // mark first field error if any
                    const first = resp.errors[0];
                    if (first?.path && fields[first.path]) {
                        setFields(prev => ({ ...prev, [first.path]: { ...prev[first.path], isInvalid: true, msg: first.message || 'Error' } }));
                    }
                }
                toast.error(msg, { duration: 6000 });
            }
        } catch (err) {
            console.error('Send error', err);
            toast.error(err.message || 'Failed to send transaction', { duration: 6000 });
        } finally {
            setSending(false);
            setShowReview(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Top Handle for App-like feel */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header / Top Bar */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Send Crypto</h6>
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate("/transactions")}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>history</span>
                </button>
            </div>

            <div className="p-4">
                {/* KYC Limit Banner */}
                {authStore?.user?.kyc_status !== 'verified' && (
                    <div className="alert bg-warning-subtle border-0 rounded-4 p-3 mb-4 d-flex align-items-center">
                        <span className="material-symbols-outlined text-warning me-3">info</span>
                        <div className="small">
                            <span className="fw-bold d-block text-warning-emphasis">Daily Send Limit</span>
                            <span className="text-muted">Unverified accounts are limited to 5 sends per day.
                                <button className="btn btn-link p-0 ms-1 small fw-bold text-decoration-none" onClick={() => navigate('/kyc-submit')}>Verify Now</button>
                            </span>
                        </div>
                    </div>
                )}

                {/* Asset Selection Preview */}
                <div
                    className="p-3 rounded-4 border shadow-sm mb-4 bg-white hover-fade"
                    onClick={handleOpenModal}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    {!selectedAsset ? (
                        <div className="d-flex align-items-center justify-content-between py-2">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: '44px', height: '44px' }}>
                                    <span className="material-symbols-outlined text-muted">add</span>
                                </div>
                                <div className="fw-bold">Select asset to send</div>
                            </div>
                            <span className="material-symbols-outlined text-muted">chevron_right</span>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '48px', height: '48px', border: '1px solid var(--border)' }}>
                                    {selectedAsset.logo ? (
                                        <img src={selectedAsset.logo} alt={selectedAsset.symbol} style={{ width: 32, height: 32, objectFit: 'contain' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; e.currentTarget.parentNode.textContent = selectedAsset.symbol?.charAt(0) || '•'; }} />
                                    ) : (
                                        <div className="fw-bold text-primary">{(selectedAsset.symbol || '•').charAt(0)}</div>
                                    )}
                                </div>
                                <div>
                                    <div className="fw-bold">{selectedAsset.name}</div>
                                    <div className="text-muted small d-flex align-items-center">
                                        <span className="badge bg-light text-dark me-2">{selectedAsset.symbol}</span>
                                        {shortenAddress(selectedAsset.address || '')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="fw-bold">{selectedAsset.balanceFiatFormatted ?? '$0.00'}</div>
                                <div className="text-muted small">
                                    {typeof selectedAsset.balance === 'number' ? selectedAsset.balance.toFixed(4) : '0.0000'} {selectedAsset.symbol}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Amount Section */}
                <div className="text-center mb-4">
                    <div className="text-muted small mb-2 fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>Enter Amount (USD)</div>
                    <FieldBlock
                        id="amount"
                        name="amount"
                        type="number"
                        value={fields.amount.value}
                        onChange={handleFieldChange}
                        isInvalid={fields.amount.isInvalid}
                        feedback={fields.amount.msg}
                        className="fw-bold w-100 bg-transparent text-center border-0 shadow-none px-0"
                        style={{ fontSize: "3.5rem", letterSpacing: "-1px", color: 'var(--text-main)' }}
                        placeholder="0.00"
                        autoFocus={true}
                    />
                    <div className="d-inline-flex align-items-center px-3 py-1 bg-light rounded-pill border shadow-sm mt-3">
                        <span className="material-symbols-outlined text-primary me-2" style={{ fontSize: '18px' }}>currency_exchange</span>
                        <span className="fw-bold small">
                            {cryptoAmount ? cryptoAmount.toFixed(8) : '0.00000000'} {selectedAsset?.symbol ?? ''}
                        </span>
                    </div>
                </div>

                {/* Recipient & Note */}
                <div className="bg-white rounded-4 border shadow-sm p-4 mb-4">
                    <FieldBlock
                        id="toAddress"
                        name="toAddress"
                        value={fields.toAddress.value}
                        onChange={handleFieldChange}
                        label="Recipient Address"
                        placeholder="Paste or type address"
                        isInvalid={fields.toAddress.isInvalid}
                        feedback={fields.toAddress.msg}
                        className="rounded-3 border-light-subtle"
                    />

                    <div className="mt-4">
                        <FieldBlock
                            id="note"
                            name="note"
                            value={fields.note.value}
                            onChange={handleFieldChange}
                            label="Note (optional)"
                            placeholder="What's this for?"
                            isInvalid={fields.note.isInvalid}
                            feedback={fields.note.msg}
                            className="rounded-3 border-light-subtle"
                        />
                    </div>
                </div>

                {/* Primary Action */}
                <div className="mb-5">
                    <button
                        className="btn btn-primary w-100 rounded-pill py-3 shadow-lg d-flex align-items-center justify-content-center fw-bold"
                        onClick={handleReview}
                    >
                        Review Transaction
                        <span className="material-symbols-outlined ms-2">chevron_right</span>
                    </button>
                </div>

                {/* Select Asset Modal */}
                <SelectAsset isOpen={isModalOpen} onClose={handleCloseModal} onSelectAsset={handleAssetSelection} />

                {/* Review Modal */}
                {showReview && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered px-3">
                            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden animate-slide-up">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Review Send</h5>
                                    <button type="button" className="btn-close shadow-none" onClick={() => setShowReview(false)}></button>
                                </div>
                                <div className="modal-body pt-0 mt-3 px-4">
                                    <div className="text-center mb-4 py-3 bg-light rounded-4 border border-dashed">
                                        <div className="text-muted small mb-1">Sending Total</div>
                                        <h3 className="fw-bold mb-0">${usdAmount.toFixed(2)}</h3>
                                        <div className="text-primary fw-bold">{cryptoAmount.toFixed(8)} {selectedAsset?.symbol}</div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Asset</span>
                                            <span className="fw-bold">{selectedAsset?.name}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Recipient</span>
                                            <span className="fw-bold text-end" style={{ maxWidth: '180px', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                                {shortenAddress(fields.toAddress.value)}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Note</span>
                                            <span className="fw-bold text-end" style={{ maxWidth: '180px', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                                {fields.note.value}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Network Fee</span>
                                            <span className="text-success fw-bold">${networkFee.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="alert alert-info border-0 rounded-4 p-3 d-flex align-items-start mb-4" style={{ backgroundColor: 'rgba(0, 82, 255, 0.05)' }}>
                                        <span className="material-symbols-outlined text-primary me-2" style={{ fontSize: '20px' }}>info</span>
                                        <div className="small text-dark-emphasis">
                                            Transactions are permanent. Please double check the recipient address before confirming.
                                        </div>
                                    </div>

                                    {/* PIN Input */}
                                    <div className="mb-4 text-center">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Enter Transaction PIN</label>
                                        <input
                                            type="password"
                                            name="pin"
                                            className={`form-control form-control-lg text-center fw-bold rounded-4 shadow-sm border-2 ${fields.pin.isInvalid ? 'border-danger' : 'border-primary-subtle'}`}
                                            placeholder="••••"
                                            maxLength="6"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={fields.pin.value}
                                            onChange={handleFieldChange}
                                            autoFocus
                                            style={{ letterSpacing: '8px', fontSize: '24px' }}
                                        />
                                        {fields.pin.isInvalid && (
                                            <div className="text-danger small mt-2 fw-bold">{fields.pin.msg}</div>
                                        )}
                                    </div>

                                    <div className="d-grid gap-3 mb-2">
                                        <button
                                            className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                                            onClick={handleSend}
                                            disabled={sending}
                                        >
                                            {sending ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Broadcasting...
                                                </>
                                            ) : 'Confirm and Send'}
                                        </button>
                                        <button
                                            className="btn btn-light rounded-pill py-3 fw-bold border mb-2"
                                            onClick={() => setShowReview(false)}
                                            disabled={sending}
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SendCrypto;