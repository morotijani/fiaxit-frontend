import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jsonGet } from '../../helpers/Ajax'
import Button from '../elements/Button'
import { useCopyToClipboard } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import FieldBlock from '../elements/FieldBlock'
import { Form } from '../../helpers/Form'


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
    // Dummy assets data - replace with real data from your wallet context or API
    const assets = [
  {
    id: "ethereum",
    name: "Ethereum",
    icon: "/icons/eth.svg",
    balance: 1.245,
    price: 3273.7
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: "/icons/btc.svg",
    balance: 0.138,
    price: 67350
  },
  {
    id: "solana",
    name: "Solana",
    icon: "/icons/sol.svg",
    balance: 24.33,
    price: 98.54
  }
];
    const [selectedAsset, setSelectedAsset] = useState(assets[0]);
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [showReview, setShowReview] = useState(false);

    const usdValue = amount ? (amount * selectedAsset.price).toFixed(2) : "0.00";
    const networkFee = 3.12; // you can fetch this dynamically later

    const handleSend = () => {
        // Here you will call your API: sendTransaction()
        console.log({
            asset: selectedAsset.id,
            address,
            amount
        });
    };

    const [fields, setFields] = useState({
        recipientAddress: {value: "", isInvalid:false, msg: ""},
        amount: {value: "", isInvalid:false, msg: ""}
    });

    async function success(resp) {
        toast.success("Transaction initiated successfully", {duration: 6000});
        navigate(-1); // go back after sending
    }

    const form = new Form('auth/login', fields, setFields, success);

    return (
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4">
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
                    className="bg-[#1A1C20] p-4 rounded-xl flex items-center justify-between mb-6 cursor-pointer"
                    onClick={() => alert("You can replace this with an asset-select modal")}
                >
                    <div className="flex items-center gap-3">
                        <img src={selectedAsset.icon} className="w-8 h-8" />
                        <div>
                            <p className="font-medium">{selectedAsset.name}</p>
                            <p className="text-gray-400 text-xs">
                            Balance: {selectedAsset.balance} {selectedAsset.name}
                            </p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined">arrow_right_alt</span>
                </div>

                {/* Address Input */}
                <FieldBlock id="recipientAddress" value={fields.recipientAddress.value} onChange={form.handleInputChanges} label="Recipient Address:" isInvalid={fields.recipientAddress.isInvalid} feedback={fields.recipientAddress.msg} />


                {/* <div className="mb-5">
                    <label className="block mb-2 text-gray-300">Recipient Address</label>
                    <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#1A1C20] p-4 rounded-xl outline-none"
                    placeholder="Enter wallet address"
                    />
                </div> */}

                {/* Amount Input */}
                {/* <div className="mb-5">
                    <label className="block mb-2 text-gray-300">Amount</label>
                    <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#1A1C20] p-4 rounded-xl outline-none"
                    type="number"
                    placeholder="0.00"
                    />
                    
                </div> */}

                <FieldBlock id="amount" value={fields.amount.value} onChange={form.handleInputChanges} label="Amount:" isInvalid={fields.amount.isInvalid} feedback={fields.amount.msg} />
                <p className="text-gray-400 text-sm mt-1">≈ ${usdValue} USD</p>


                {/* Send Button */}
                <div className="d-grid">
                    <Button varaint=""
                        disabled={!address || !amount}
                        onClick={() => setShowReview(true)}
                        className="btn-dark mt-6 w-full"
                    >
                        Review Send
                    </Button>
                </div>

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