import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../elements/Button'
import { shortenAddress } from '../../helpers/StringHelpers'
import FieldBlock from '../elements/FieldBlock'
import { jsonPost } from '../../helpers/Ajax'
import SelectAsset from './SelectAsset';
import toast from 'react-hot-toast';

function SendCrypto() {
    const navigate = useNavigate();

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
        privateKey: { value: '', isInvalid: false, msg: '' }
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
                crypto_price: { ...prev.crypto_price, value: '' },
                privateKey: { ...prev.privateKey, value: '' }
            }));
            return;
        }
        setFields(prev => ({
            ...prev,
            crypto_id: { ...prev.crypto_id, value: selectedAsset.rawInfo.id ?? '' },
            crypto_symbol: { ...prev.crypto_symbol, value: selectedAsset.symbol ?? '' },
            crypto_name: { ...prev.crypto_name, value: selectedAsset.name ?? selectedAsset.symbol ?? '' },
            crypto_price: { ...prev.crypto_price, value: String(selectedAsset.price ?? 0) },
            privateKey: { ...prev.privateKey, value: selectedAsset.wallet_privatekey ?? '' }
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

    const handleReview = () => {
        if (!validateBeforeReview()) return;
        setShowReview(true);
    };

    const handleSend = async () => {
        if (!validateBeforeReview()) return;
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
                privateKey: fields.privateKey.value || null
            };

            const resp = await jsonPost(`trade/${selectedAsset?.symbol.toLowerCase()}/send`, payload, null);
            console.log('payload', resp);
            if (resp && resp.success) {
                toast.success('Transaction initiated successfully', { duration: 6000 });
                navigate(-1);
            } else {
                const msg = resp?.message || 'Send failed';
                // process field errors if present
                if (resp?.errors && Array.isArray(resp.errors)) {
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
            toast.error('Failed to send transaction', { duration: 6000 });
        } finally {
            setSending(false);
            setShowReview(false);
        }
    };

    return (
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4" style={{ boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)" }}>
                {/* top bar */}
                <div className="mb-3 mx-auto" style={{ width: "50%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "2px" }}></div>

                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">keyboard_backspace</span>
                    </button>
                    <h6 className="mb-0">Send Crypto Funds</h6>
                    <div style={{ width: 36 }} />
                </div>
            </div>
            <div className="p-4">

                {/* Select Asset */}
                <div className="bg-warning bg-opacity-10 border-warning border-opacity-25 p-2 rounded-3 mb-3" onClick={handleOpenModal} style={{ cursor: 'pointer' }} title="Click to select an asset">
                    {!selectedAsset ? (
                        <div className="text-center text-body-secondary">
                            <span>Click to select an asset to send funds</span>
                        </div>
                    ) : (
                        <div className="row align-items-center">
                            <div className="col-auto">
                                {selectedAsset.logo ? (
                                    <img src={selectedAsset.logo} alt={selectedAsset.symbol} style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.style.display='none'; }} />
                                ) : (
                                    <div className="fw-bold">{(selectedAsset.symbol || '•').charAt(0)}</div>
                                )}
                            </div>
                            <div className="col ms-n2">
                                <h6 className="fs-base fw-normal mb-0">{selectedAsset.name}</h6>
                                <span className="fs-sm text-body-secondary">{shortenAddress(selectedAsset.address || '')}</span>
                                <br />
                                <span className="text-body-secondary">Available: {typeof selectedAsset.balance === 'number' ? selectedAsset.balance : (selectedAsset.balance ?? 0)} {selectedAsset.symbol}</span>
                            </div>
                            <div className="col-auto">
                                <h6 className="fs-base fw-normal mb-0">Bal: {selectedAsset.balanceFiatFormatted ?? '$0.00'}</h6>
                            </div>
                        </div>
                    )}
                </div>
              
                {/* Price row */}
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: "12px" }}>
                    <span>{selectedAsset?.symbol ?? 'Crypto'} current market price:</span>
                    <span><strong>{selectedAsset?.priceFormatted ?? (pricePerUnit ? `$${pricePerUnit.toFixed(2)}` : '$0.00')} USD</strong></span>
                </div>

                {/* Amount Input (USD) */}
                <FieldBlock
                    id="amount"
                    name="amount"
                    type="number"
                    value={fields.amount.value}
                    onChange={handleFieldChange}
                    label="Amount (USD):"
                    isInvalid={fields.amount.isInvalid}
                    feedback={fields.amount.msg}
                    className="fw-bolder w-100 bg-transparent text-center font-monospace"
                    style={{ outline: "2px solid transparent", outlineOffset: "2px", height: "6rem", fontSize: "2.5rem" }}
                    autoFocus={true}
                />

                <div className="bg-light rounded-3 p-3 mb-3" style={{ fontSize: "13px" }}>
                    <div className="d-flex justify-content-between text-xs text-muted">
                        <span className="fw-semibold">Amount in Crypto</span>
                        <span>
                            {selectedAsset?.name ?? '—'}:&nbsp;
                            <strong id="amount-in-crypto-amount">{cryptoAmount ? cryptoAmount.toFixed(8) : '0.00000000'} {selectedAsset?.symbol ?? ''}</strong>
                        </span>
                    </div>
                </div>

                {/* Address Input */}
                <FieldBlock
                    id="toAddress"
                    name="toAddress"
                    value={fields.toAddress.value}
                    onChange={handleFieldChange}
                    label="Recipient Address:"
                    isInvalid={fields.toAddress.isInvalid}
                    feedback={fields.toAddress.msg}
                />

                {/* Note */}
                <FieldBlock
                    id="note"
                    name="note"
                    value={fields.note.value}
                    onChange={handleFieldChange}
                    label="Note (optional):"
                    isInvalid={fields.note.isInvalid}
                    feedback={fields.note.msg}
                />

                {/* Send Button */}
                <div className="d-grid mt-3">
                    <Button
                        variant="primary"
                        className="btn-dark mt-6 w-100"
                        onClick={handleReview}
                    >
                        Review Send
                    </Button>
                </div>

                {/* Select Asset Modal */}
                <SelectAsset isOpen={isModalOpen} onClose={handleCloseModal} onSelectAsset={handleAssetSelection} />

                {/* Review Modal */}
                {showReview && (
                    <div className="fixed inset-0 bg-black/60 d-flex justify-content-center align-items-center p-6" role="dialog" aria-modal="true">
                        <div className="bg-white w-100" style={{ maxWidth: 560, borderRadius: 12, padding: 20 }}>
                            <h4 className="mb-3">Review Transaction</h4>

                            <div className="mb-3">
                                <div className="text-muted small">Asset</div>
                                <div className="fw-medium">{selectedAsset?.name} ({selectedAsset?.symbol})</div>
                            </div>

                            <div className="mb-3">
                                <div className="text-muted small">Recipient</div>
                                <div className="fw-medium break-all">{fields.toAddress.value}</div>
                            </div>

                            <div className="mb-3">
                                <div className="text-muted small">Amount</div>
                                <div className="fw-medium">{cryptoAmount ? cryptoAmount.toFixed(8) : '0.00000000'} {selectedAsset?.symbol} ({`$${usdAmount.toFixed(2)}`})</div>
                            </div>

                            <div className="mb-3">
                                <div className="text-muted small">Network Fee</div>
                                <div className="fw-medium">{networkFee ? `$${networkFee.toFixed(2)}` : '$0.00'}</div>
                            </div>

                            <div className="d-grid gap-2">
                                <Button variant="primary" className="btn btn-dark" onClick={handleSend} disabled={sending}>
                                    {sending ? 'Sending…' : 'Confirm Send'}
                                </Button>
                                <Button variant="secondary" className="btn btn-light" onClick={() => setShowReview(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SendCrypto;