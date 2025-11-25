import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../elements/Button'
import { shortenAddress } from '../../helpers/StringHelpers'
import FieldBlock from '../elements/FieldBlock'
import { Form } from '../../helpers/Form'
import SelectAsset from './SelectAsset';
import toast from 'react-hot-toast';

const CACHE_PREFIX = 'receive_asset_cache_v1_';
const DEFAULT_CACHE_TTL_MIN = 5; // minutes

function setCachedData(key, data, ttlInMinutes = DEFAULT_CACHE_TTL_MIN) {
    try {
        const expiresAt = Date.now() + ttlInMinutes * 60 * 1000;
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, expiresAt }));
    } catch (err) {
        console.error('setCachedData error', err);
    }
}

function getCachedData(key) {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const { data, expiresAt } = JSON.parse(raw);
        if (!expiresAt || Date.now() > expiresAt) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return data;
    } catch (err) {
        console.error('getCachedData error', err);
        return null;
    }
}

function SendCrypto() {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState('Select Asset');
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [showReview, setShowReview] = useState(false);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleAssetSelection = (asset) => {
        setSelectedAsset(asset);
        handleCloseModal(); // Close the modal after selection
    };

    const usdValue = amount ? (amount * selectedAsset.price).toFixed(2) : "0.00";
    const cryptoAmount = amount ? (amount / selectedAsset.price).toFixed(8) : "0.00000000";
    const networkFee = 3.12; // you can fetch this dynamically later

    const handleSend = () => {
        // Here you will call your API: sendTransaction()
        console.log({
            asset: selectedAsset.id,
            address,
            amount, 
        });
    };

    const [fields, setFields] = useState({
        crypto_id: selectedAsset.id ?? null,
        crypto_symbol: selectedAsset.symbol ?? null,
        crypto_name: selectedAsset.name ?? null, 
        crypto_price: selectedAsset.price ?? null, 
        toAddress: {value: "", isInvalid:false, msg: ""},
        privateKey: selectedAsset.wallet_privatekey,
        amount: {value:"", isInvalid:false, msg: ""},
        feeRate: "0",
        note: {value:"", isInvalid:false, msg: ""}
    });

    async function success(resp) {
        toast.success("Transaction initiated successfully", {duration: 6000});
        navigate(-1); // go back after sending
    }

    const form = new Form('auth/login', fields, setFields, success);
    console.log('selectedAsset qwd', selectedAsset);

    return (
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4" style={{ boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)" }}>
                {/* top bar */}
                <div className="mb-3 mx-auto" style={{ width: "50%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "2px" }}></div>

                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">keyboard_backspace</span>
                    </button>
                    <h6 className="mb-0">Send Crypto</h6>
                    <div style={{ width: 36 }} />
                </div>
            </div>
            <div className="p-4">

                {/* Select Asset */}
                <div className="bg-warning bg-opacity-10 border-warning border-opacity-25 p-2 rounded-3 mb-3" onClick={handleOpenModal} style={{ cursor: 'pointer' }} title='Click to select an asset'>
                    {selectedAsset === 'Select Asset' ? (
                        <div className="text-center text-body-secondary">
                            <span>Select Asset to Send</span>
                        </div>
                    ) :
                        <div className="row align-items-center">
                            <div className="col-auto">
                                <div className="avatar">
                                    {selectedAsset.logo ? (
                                        <img
                                            src={selectedAsset.logo}
                                            alt={selectedAsset.symbol || selectedAsset.name}
                                            style={{ width: 36, height: 36, objectFit: 'contain' }}
                                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="fw-bold">{(selectedAsset.symbol || '•').charAt(0)}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col ms-n2">
                                <h6 className="fs-base fw-normal mb-0">{selectedAsset.name}</h6>
                                <span className="fs-sm text-body-secondary">{shortenAddress(selectedAsset.address)}</span>
                                <br /><span className="text-body-secondary">Available: {selectedAsset.balance} {selectedAsset.symbol}</span>
                            </div>
                            <div className="col-auto">
                                <h6 className="fs-base fw-normal mb-0">Bal: {selectedAsset.balanceFiatFormatted}</h6>
                            </div>
                        </div>
                    }
                </div>

                {/*  */}
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: "12px" }}>
                    <span>
                        {selectedAsset.symbol ?? 'Crypto'} current market price:
                    </span> 
                    <span>
                        <strong>{selectedAsset.priceFormatted ? selectedAsset.priceFormatted : '$0.00'} USD</strong>
                    </span>
                </div>

                {/* Amount Input */}
                <FieldBlock id="amount" inputmode="decimal" value={fields.amount.value} onChange={form.handleInputChanges} label="Amount ($):" isInvalid={fields.amount.isInvalid} feedback={fields.amount.msg} className="fw-bolder w-100 bg-transparent text-center font-monospace" style={{ outline: "2px solid transparent", outlineOffset: "2px", height: "10rem", fontSize: "4rem"}} autoFocus={true} />

                <div className="bg-light rounded-3 p-3" style={{ fontSize: "13px" }}>
                    <div className="d-flex justify-content-between text-xs text-muted">
                        <span className="fw-semibold">Amount in Crypto</span> 
                        <span>
                            <span id="amount-in-crypto-crypto">≈ {selectedAsset.name}</span>:&nbsp; 
                            <span id="amount-in-crypto-amount">{cryptoAmount} {selectedAsset.symbol}</span>
                        </span>
                    </div>
                </div>

                {/* Address Input */}
                <FieldBlock id="toAddress" value={fields.toAddress.value} onChange={form.handleInputChanges} label="Recipient Address:" isInvalid={fields.toAddress.isInvalid} feedback={fields.toAddress.msg} />

                {/* Note */}
                <FieldBlock id="note" value={fields.note.value} onChange={form.handleInputChanges} label="Note:" feedback={fields.note.msg} />

                {/* Send Button */}
                <div className="d-grid">
                    <Button varaint=""
                        disabled={!address || !amount || selectedAsset === 'Select Asset'}
                        onClick={() => setShowReview(true)}
                        className="btn-dark mt-6 w-full"
                    >
                        Review Send
                    </Button>
                </div>

                {/* Select Asset Modal */}
                <SelectAsset 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    onSelectAsset={handleAssetSelection} 
                />

                {/* Review Modal */}
                {showReview && (
                    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-6">
                        <div className="bg-[#1A1C20] w-full max-w-md p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold mb-4">Review Transaction</h2>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Asset</p>
                                <p className="font-medium">{selectedAsset.name}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Recipient</p>
                                <p className="font-medium break-all">{address}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Amount</p>
                                <p className="font-medium">
                                    {amount} {selectedAsset.name} (${usdValue})
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Network Fee</p>
                                <p className="font-medium">${networkFee}</p>
                            </div>

                            {/* Confirm */}
                            <button
                                onClick={handleSend}
                                className="w-full bg-blue-600 py-3 rounded-xl mt-2 font-semibold"
                            >
                                Confirm Send
                            </button>

                            {/* Cancel */}
                            <button
                                onClick={() => setShowReview(false)}
                                className="w-full py-3 rounded-xl mt-3 text-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SendCrypto;