import { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonGet } from '../../helpers/Ajax'
import { shortenAddress, useCopyToClipboard } from '../../helpers/StringHelpers'
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function WalletDetails() {
    const navigate = useNavigate();
    const [isCopied, copyToClipboard] = useCopyToClipboard();
    const [walletInfoStore, walletDispatch] = useContext(WalletContext);
    let { id } = useParams()
    // on component load, fetch wallet details
    const [assets, setAssets] = useState([]);
    const [loadingWallet, setLoadingWallet] = useState(true);
    const timeAgo = (date) => {
        // Pass addSuffix: true to add "ago" at the end
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    // find wallet by id from url param (cached by backend)
    async function fetchWalletById(id) {
        try {
            const resp = await jsonGet(`wallets/${id}`);
            if (resp && resp.success) {
                return resp.wallet;
            }
        } catch (err) {
            // treat errors gracefully
            console.error('fetchWalletById error', err);
        }
        return null;
    }

    // set cached data
    const setCachedData = (key, data, ttlInMinutes = 60) => {
        const ttlInMilliseconds = ttlInMinutes * 60 * 1000;
        const expiresAt = new Date().getTime() + ttlInMilliseconds;

        try {
            localStorage.setItem(key, JSON.stringify({ data, expiresAt }));
        } catch (err) {
            console.error('Error setting cached data:', err);
        }
    };

    // fucntion to get cached data
    const getCachedData = (key) => {
        try {
            const cachedItem = localStorage.getItem(key);
            if (!cachedItem) return null;

            const { data, expiresAt } = JSON.parse(cachedItem);
            if (Date.now() > expiresAt) {
                // If cached data is expired, remove it
                localStorage.removeItem(key);
                return null;
            }
            return data;
        } catch (err) {
            console.error('Error getting cached data:', err);
            return null;
        }
    };

    // create a function to convert balance
    async function convertCryptoToFiat(amount, fromCurrency, toCurrency) {
        try {
            const resp = await jsonGet(`convert/${fromCurrency}/${toCurrency}/${amount}/crypto-to-fiat`);
            return resp?.data?.to?.amount || 0;
        } catch (err) {
            // if conversion fails, fallback to 0
            console.warn('convertCryptoToFiat failed', err);
            return 0;
        }
    }

    useEffect(() => {
        let mounted = true;

        (async function startup() {
            const w = await fetchWalletById(id);
            if (!w) {
                toast.error('Wallet not found !', {duration: 6000});
                navigate('/wallets');
                setLoadingWallet(false);
                return;
            }
            
            // fetch wallet info, balance, transactions etc
            try {
                const crypto_symbol = (w.wallet_symbol || '').toLowerCase();
                const address = w.wallet_address || '';
                const crypto_name = (w.wallet_crypto_name || '').toLowerCase();

                // check if there is local storage cached data
                const localCachedData = getCachedData(`wallet_info_${w.wallet_id}`);
                if (localCachedData) {
                    console.log('Using local storage cached data for wallet info', localCachedData);
                    const asset = {
                        ...w, 
                        rawInfo: localCachedData
                    };
                    setAssets([asset]);
                }
                setLoadingWallet(false);
                if (localCachedData) {
                    // If we have local cached data, we can use it and skip fetching
                    if (mounted) {
                        // setAssets([asset]);
                        setLoadingWallet(false);
                    }
                    return;
                }
                
            
                const infoPromise = jsonGet(`wallets/${crypto_symbol}/mhxwNC4yW82KdcwsAPi81d8dcMSvmWoTSc/info`);
                // const infoPromise = jsonGet(`wallets/${crypto_symbol}/${address}/info`);
                const infoResp = await infoPromise;
                const infoData = infoResp?.data ?? null;

                if (infoData) {
                    // process infoData as needed
                    let balance = infoData.balance.total || 0;
                    if (typeof infoData.balance === 'object' && infoData.balance !== null) {
                        balance = parseFloat(infoData.balance.total) || 0;
                    } else {
                        balance = parseFloat(infoData.balance) || 0;
                    }
                    infoData.balance.total = balance;

                    // convert balance to fiat (USD)
                    try {
                        infoData.balance.fiat = await convertCryptoToFiat(balance, crypto_name, 'usd');
                    } catch (err) {
                        console.warn('Balance conversion failed', err);
                        infoData.balance.fiat = 0;
                    }

                    // convert totalReceived and totalSent to fiat (USD)
                    try {
                        infoData.totalReceived = await convertCryptoToFiat(infoData.totalReceived || 0, crypto_name, 'usd');
                    } catch (err) {
                        console.warn('Total received conversion failed', err);
                        infoData.totalReceived = 0;
                    }

                    // convert totalSent to fiat (USD)
                    try {
                        infoData.totalSent = await convertCryptoToFiat(infoData.totalSent || 0, crypto_name, 'usd');
                    } catch (err) {
                        console.warn('Total sent conversion failed', err);
                        infoData.totalSent = 0;
                    }

                    // formatted balance
                    infoData.balance.fiatFormatted = `$${infoData.balance.fiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                    // format totalReceived
                    infoData.totalReceivedFormatted = `$${(infoData.totalReceived || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                    // format totalSent
                    infoData.totalSentFormatted = `$${(infoData.totalSent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                    // cache data into local storage
                    setCachedData(`wallet_info_${w.wallet_id}`, infoData, 5); // cache for 5 minutes

                    const asset = {
                        ...w, 
                        rawInfo: infoData,
                    };

                    if (mounted) {
                        setAssets([asset]);
                        setLoadingWallet(false);
                    }

                }
            } catch (error) {
                console.error('Error fetching wallet info:', error);
            }

            return () => {
                mounted = false;
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const handleCopy = () => {
        copyToClipboard(assets[0]?.wallet_address || '');
    };

    return (
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">keyboard_backspace</span>
                    </button>
                    <h6 className="mb-0">{assets[0]?.rawInfo.wallet_name || assets[0]?.wallet_id || 'Wallet'}</h6>
                    <button className="btn btn-light btn-sm" onClick={() => navigate('/deposit')}>
                        Deposit
                    </button>
                </div>

                {loadingWallet ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <small className="text-muted ms-2">Loading wallet info...</small>
                        </div>
                    ) : (
                        
                        (assets.length ? assets : []).map((t) => {
                            return (
                                <div key={t.wallet_id} >
                                    <div className="text-center text-muted small mt-2">
                                        <span className={`badge bg-${isCopied ? 'info' : 'dark'} bg-opacity-10 text-dark rounded-pill px-3 py-2`} onClick={handleCopy} style={{cursor: 'pointer'}}>{shortenAddress(t.wallet_address)}&nbsp;&nbsp;<i className="bi bi-back"></i>
                                        </span>
                                    </div>
                                    {/* Balance */}
                                    <div className="text-center my-3">
                                        <h3 className="fw-bold">{t.rawInfo.balance.fiatFormatted}</h3>
                                        <div className="text-success small fw-semibold">
                                            + {t.rawInfo.totalSentFormatted}(+{t.rawInfo.totalReceivedFormatted}%)
                                            <div className="small text-muted">
                                                <div>Total Sent: {t.rawInfo.totalSentFormatted}</div>
                                                <div>Total Received: {t.rawInfo.totalReceivedFormatted}</div>
                                            </div>
                                        </div>
                                        <div className="small text-muted">Bal: {Number(t.rawInfo.balance.total || 0)}</div>
                                    </div>

                                    
                                    {/* Action Buttons */}
                                    <div className="d-flex justify-content-around my-3 pb-3">
                                        <div className="text-center">
                                            <div
                                                className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                                                style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6" }}
                                            >
                                                <i className="bi bi-arrow-up-left"></i>
                                            </div>
                                            <small>Send</small>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                                                style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6" }}
                                            >
                                                <i className="bi bi-arrow-down-left"></i>
                                            </div>
                                            <small>Request</small>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                                                style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6" }}
                                            >
                                                <i className="bi bi-arrow-left-right"></i>
                                            </div>
                                            <small>Swap</small>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                                                style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6" }}
                                            >
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </div>
                                            <small>More</small>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            
                <div className="p-4">
                    {loadingWallet ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <small className="text-muted ms-2">Loading wallet transactions...</small>
                        </div>
                    ) : (
                        
                        // (assets.length ? assets : []).map((t) => {
                        (assets.length ? assets : []).map((t) => {
                            const txs = (t.rawInfo && t.rawInfo.transactions) ? t.rawInfo.transactions : [];
                            return (
                                <div key={t.wallet_id}>
                                    {/* Header */}
                                    <div className="text-center mb-2">
                                        <h6 className="">Wallet transactions &nbsp;
                                            <span className="badge rounded-pill bg-dark">{t.rawInfo.txCount || txs.length || 0}</span>
                                        </h6>
                                        <p className="text-muted small mb-0">View and manage your wallets</p>
                                    </div>

                                    {txs.length ? (
                                        txs.map((tx, index) => {
                                            // create a variable to check if tx amount or value starts with '-', it's a sent transaction, else received
                                            const amountString = String(tx.amount) || String(tx.value) || '';
                                            const isSent = amountString.startsWith('-') || amountString.startsWith('-');
                                            const changeClass = (tx.amount >= 0 || tx.value >= 0) ? 'text-success' : 'text-danger';
                                            // receiving transaction address is in inputs, sending address is in outputs
                                            const to_address = isSent ? tx.outputs[0].addresses : tx.inputs[0].addresses;
                                            const to_address_quoted = `${to_address}`; // put double quotes around the to_address

                                            // conver amount to  money format
                                            const amountValue = parseFloat(tx.amount || tx.value || 0);
                                            const formattedAmount = isSent ? `- ${Math.abs(amountValue)}` : `+ ${Math.abs(amountValue)}`;
                                        
                                        return (
                                            <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                                        isSent ? "bg-danger-subtle" : "bg-success-subtle"}`}
                                                    style={{ width: 40, height: 40 }}
                                                    >
                                                    {isSent ? (
                                                        <span className="material-symbols-outlined text-success">arrow_downward</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-danger">arrow_upward</span>
                                                    )}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{shortenAddress(to_address_quoted)}</div>
                                                        <div className="text-muted small">{timeAgo(tx.timestamp)}</div>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className={`fw-semibold ${
                                                        isSent ? "text-danger" : "text-success"
                                                    }`}
                                                    >
                                                        {formattedAmount}
                                                    </div>
                                                    <div className={`small ${changeClass}`}>
                                                        {tx.status ?? tx.confirmations ? 'Confirmed' : 'Pending'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    )
                                    ) : (
                                        <div className="text-center text-muted py-3">
                                            No transactions found.
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}

            </div>
        </div>
    )
}

export default WalletDetails;