import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../elements/Button'
import { shortenAddress } from '../../helpers/StringHelpers'
import FieldBlock from '../elements/FieldBlock'
import { jsonPost } from '../../helpers/Ajax'
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
    const [selectedAsset, setSelectedAsset] = useState(null); // object or null
    const [address, setAddress] = useState("");
    const [amountUsd, setAmountUsd] = useState(""); // user enters USD amount
    const [showReview, setShowReview] = useState(false);
    const [sending, setSending] = useState(false);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleAssetSelection = (asset) => {
        setSelectedAsset(asset || null);
        handleCloseModal();
    };

    // Derived values
    const price = Number(selectedAsset?.price ?? 0);
    const cryptoAmount = (price > 0 && amountUsd !== "" && !isNaN(Number(amountUsd)))
        ? (Number(amountUsd) / price)
        : 0;
    const usdValue = amountUsd ? Number(amountUsd).toFixed(2) : "0.00";
    const networkFee = 3.12; // placeholder; fetch later if needed

    // Keep local fields in sync when asset changes
    useEffect(() => {
        // optionally pre-fill or validate address when asset changes
        // no-op for now
    }, [selectedAsset]);

    const validate = () => {
        if (!selectedAsset) {
            toast.error("Please select an asset");
            return false;
        }
        if (!amountUsd || Number(amountUsd) <= 0 || isNaN(Number(amountUsd))) {
            toast.error("Enter a valid amount in USD");
            return false;
        }
        if (!address || String(address).trim() === "") {
            toast.error("Recipient address is required");
            return false;
        }
        // optional: check balance (asset.balance is crypto amount)
        const bal = Number(selectedAsset?.balance ?? 0);
        if (bal > 0 && cryptoAmount > bal + 1e-12) {
            toast.error("Insufficient balance");
            return false;
        }
        if (price <= 0) {
            toast.error("Selected asset has invalid price");
            return false;
        }
        return true;
    };

    const handleSend = async () => {
        if (!validate()) return;

        setSending(true);
        try {
            const payload = {
                crypto_id: selectedAsset.wallet_id ?? selectedAsset.id ?? null,
                crypto_symbol: selectedAsset.symbol ?? null,
                crypto_name: selectedAsset.name ?? null,
                crypto_price: price,
                to_address: address,
                amount_crypto: Number(cryptoAmount),
                amount_usd: Number(amountUsd),
                network_fee: Number(networkFee)
            };

            // call your API - ensure jsonPost exists in helpers/Ajax
            const resp = await jsonPost('transactions/send', payload);
            if (resp && resp.success) {
                toast.success("Transaction initiated successfully", { duration: 6000 });
                // optionally navigate or update state/store
                navigate(-1);
            } else {
                const msg = resp?.message || 'Send failed';
                toast.error(msg, { duration: 6000 });
            }
        } catch (err) {
            console.error('handleSend error', err);
            toast.error("Failed to send transaction", { duration: 6000 });
        } finally {
            setSending(false);
            setShowReview(false);
        }
    };

    const handleConfirmClick = () => {
        // open review modal
        if (!validate()) return;
        setShowReview(true);
    };

    const formatFiat = (v) => {
        const n = Number(v) || 0;
        return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
                    <h6 className="mb-0">Send Crypto</h6>
                    <div style={{ width: 36 }} />
                </div>
            </div>

            <div className="p-4">
                {/* Select Asset */}
                <div
                    className="bg-warning bg-opacity-10 border-warning border-opacity-25 p-2 rounded-3 mb-3"
                    onClick={handleOpenModal}
                    style={{ cursor: 'pointer' }}
                    title='Click to select an asset'
                    role="button"
                >
                    {!selectedAsset ? (
                        <div className="text-center text-body-secondary">
                            <span>Select Asset to Send</span>
                        </div>
                    ) : (
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
                                <span className="fs-sm text-body-secondary">{shortenAddress(selectedAsset.address || '')}</span>
                                <br />
                                <span className="text-body-secondary">Available: {Number(selectedAsset.balance ?? 0)} {selectedAsset.symbol}</span>
                            </div>
                            <div className="col-auto">
                                <h6 className="fs-base fw-normal mb-0">{selectedAsset?.balanceFiatFormatted ?? formatFiat((selectedAsset?.balance ?? 0) * price)}</h6>
                            </div>
                        </div>
                    )}
                </div>

                {/*  Price row */}
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: "12px" }}>
                    <span>
                        {selectedAsset?.symbol ?? 'Crypto'} current market price:
                    </span>
                    <span>
                        <strong>{selectedAsset?.priceFormatted ?? formatFiat(price)} USD</strong>
                    </span>
                </div>

                {/* Amount Input (USD) */}
                <FieldBlock
                    id="amountUsd"
                    inputmode="decimal"
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    label="Amount (USD):"
                    className="fw-bolder w-100 bg-transparent text-center font-monospace"
                    style={{ outline: "2px solid transparent", outlineOffset: "2px", height: "6rem", fontSize: "2.5rem" }}
                    autoFocus={true}
                />

                <div className="bg-light rounded-3 p-3" style={{ fontSize: "13px" }}>
                    <div className="d-flex justify-content-between text-xs text-muted">
                        <span className="fw-semibold">Amount in Crypto</span>
                        <span>
                            <span id="amount-in-crypto-crypto">{selectedAsset?.name ?? '—'}</span>:&nbsp;
                            <span id="amount-in-crypto-amount">{cryptoAmount ? cryptoAmount.toFixed(8) : '0.00000000'} {selectedAsset?.symbol ?? ''}</span>
                        </span>
                    </div>
                </div>

                {/* Address Input */}
                <FieldBlock
                    id="toAddress"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    label="Recipient Address:"
                />

                {/* Note (optional) */}
                <FieldBlock
                    id="note"
                    value=""
                    onChange={() => {}}
                    label="Note (optional):"
                />

                {/* Send Button */}
                <div className="d-grid mt-3">
                    <Button
                        variant=""
                        disabled={!address || !amountUsd || !selectedAsset}
                        onClick={handleConfirmClick}
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
                    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-6" role="dialog" aria-modal="true">
                        <div className="bg-[#1A1C20] w-full max-w-md p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold mb-4">Review Transaction</h2>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Asset</p>
                                <p className="font-medium">{selectedAsset?.name}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Recipient</p>
                                <p className="font-medium break-all">{address}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Amount</p>
                                <p className="font-medium">
                                    {cryptoAmount ? cryptoAmount.toFixed(8) : '0.00000000'} {selectedAsset?.symbol} ({formatFiat(usdValue)})
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Network Fee</p>
                                <p className="font-medium">{formatFiat(networkFee)}</p>
                            </div>

                            <div className="d-grid gap-2">
                                <button
                                    onClick={handleSend}
                                    disabled={sending}
                                    className="w-full bg-blue-600 py-3 rounded-xl mt-2 font-semibold"
                                >
                                    {sending ? 'Sending…' : 'Confirm Send'}
                                </button>

                                <button
                                    onClick={() => setShowReview(false)}
                                    className="w-full py-3 rounded-xl mt-3 text-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SendCrypto;