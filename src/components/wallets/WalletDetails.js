import { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonGet } from '../../helpers/Ajax'
import { shortenAddress, useCopyToClipboard } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';

function WalletDetails() {
    const navigate = useNavigate();
    const [isCopied, copyToClipboard] = useCopyToClipboard();
    const [walletInfoStore, walletDispatch] = useContext(WalletContext);
    let { id } = useParams()

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

    // on component load, fetch wallet details
    const [assets, setAssets] = useState([]);
    const [loadingWallet, setLoadingWallet] = useState(true);

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

            // first check if we have cached info in context
            const cachedInfo = walletInfoStore.wallets.find((wallet) => wallet.wallet_id === w.wallet_id)?.rawInfo;
            console.log('Using cached wallet info', cachedInfo);
            if (cachedInfo) {
                // check if cached info is expired
                const now = Date.now();
                const expiry =  cachedInfo.expiry || 0;
                if (now < expiry) {
                    // use cached info
                    const asset = {
                        id: w.wallet_id,
                        name: w.wallet_name,
                        symbol: w.wallet_symbol,
                        address: w.wallet_address,
                        crypto_name: w.wallet_crypto_name,
                        rawInfo: cachedInfo,
                        // balance: cachedInfo.balance,
                        // transactions: cachedInfo.transactions
                    };
                    setAssets([asset]);
                }
                setLoadingWallet(false);
                return;
            }

            const crypto_symbol = (w.wallet_symbol || '').toLowerCase();
            const address = w.wallet_address || '';
            const crypto_name = (w.wallet_crypto_name || '').toLowerCase();

            // fetch wallet info, balance, transactions etc
            try {
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

                    // cache info in context
                    walletDispatch(
                        {
                            type: 'walletInfoViewed', 
                            payload: {
                                wallet_id: w.wallet_id,
                                info: infoData, 
                                expiry: Date.now() + (5 * 60 * 1000) // cache for 5 minutes
                            }
                        });

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
                            const changeClass = (t.change >= 0) ? 'text-success' : 'text-danger';
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
                                        txs.map((tx, index) => (
                                            <div key={index} className="border-bottom py-2">
                                                <div className="small text-muted">Transaction ID</div>
                                                <div className="fw-semibold">{tx.id || tx.txid || tx.hash}</div>
                                                <div className="small text-muted">Amount</div>
                                                <div>{tx.amount ?? tx.value ?? '-'}</div>
                                                <div className="small text-muted">Status</div>
                                                <div>{tx.status ?? tx.confirmations ? 'Confirmed' : 'Pending'}</div>
                                            </div>
                                        ))
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