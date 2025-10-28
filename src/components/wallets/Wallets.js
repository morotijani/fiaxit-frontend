import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonDelete, jsonGet } from '../../helpers/Ajax'
import { shortenAddress } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';

function Wallets() {
    const navigate = useNavigate();
    const [walletStore, walletDispatch] = useContext(WalletContext);

    async function handleContactDelete(id) {
        if (window.confirm("Are you siure you want to delete this contact?  This cannot be undone !")) {
            const resp = await jsonDelete(`contacts/${id}`)
            if (resp.success) {
                walletDispatch({type: 'contactDeleted', payload: id});
                toast.success("Contacted deleted !", {duration :6000})
            } else {
                toast.failed("Something went wrong please try again !", {duration :6000})
            }
        }
    }


   // state for enriched wallets (info + balance)
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchWallets() {
            try {
                setLoadingAssets(true);

                const storeWallets = (walletStore && walletStore.wallets) ? walletStore.wallets : [];
                if (!storeWallets.length) {
                    if (mounted) {
                        setAssets([]); // no wallets in DB
                        setLoadingAssets(false);
                    }
                    return;
                }

                const jobs = storeWallets.map(async (w) => {
                    const symbol = (w.wallet_crypto || '').toUpperCase();
                    const address = w.wallet_address || '';

                    // fetch crypto info and balance in parallel
                    const infoPromise = jsonGet(`convert/coinmarketcap/latest/${symbol.toLowerCase()}`);
                   // const balancePromise = jsonGet(`wallets/${symbol}/${address}/balance`);

                    //const [infoResp, balanceResp] = await Promise.all([infoPromise, balancePromise]).catch(e => [null, null]);
                    const infoResp = await Promise.all([infoPromise]).catch(e => [null, null]);

                    // normalize infoResp.data
                    let infoData = null;
                    if (infoResp && infoResp.success && infoResp.data) {
                        // API might return an object keyed by symbol or an array
                        const d = infoResp.data;
                        if (Array.isArray(d)) infoData = d[0];
                        else if (typeof d === 'object') {
                            const keys = Object.keys(d);
                            if (keys.length === 1 && d[keys[0]]) infoData = d[keys[0]];
                            else infoData = d;
                        } else {
                            infoData = d;
                        }
                    }
                    console.log('Wallet info data for', symbol, address, infoData);

                    // pick sensible fields with fallbacks
                    const name = infoData?.name || symbol;
                    const logo = infoData?.logo || infoData?.logo_url || infoData?.icon || (infoData?.id ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${infoData.id}.png` : null);
                    const price = Number(
                        infoData?.price ||
                        infoData?.quote?.USD?.price ||
                        infoData?.last_price ||
                        0
                    );
                    const change = Number(
                        infoData?.quote?.USD?.percent_change_24h ||
                        infoData?.percent_change_24h ||
                        infoData?.change_percent_24h ||
                        0
                    );

                    // balance response normalization
                    // let balance = 0;
                    // if (balanceResp && balanceResp.success && balanceResp.data != null) {
                    //     // balance may be number or object with 'balance' key
                    //     if (typeof balanceResp.data === 'number') balance = balanceResp.data;
                    //     else if (typeof balanceResp.data === 'object') balance = Number(balanceResp.data.balance ?? balanceResp.data.amount ?? 0);
                    // }

                    //const valueNum = (Number(price) || 0) * (Number(balance) || 0);
                    //const valueStr = `$${valueNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                    return {
                        id: `${symbol}_${address}`,
                        symbol,
                        name,
                        logo,
                        price,
                        change,
                        // balance,
                        // value: valueStr,
                        rawInfo: infoData,
                        // rawBalance: balanceResp?.data ?? null,
                        address
                    };
                });

                const results = await Promise.all(jobs);
                if (mounted) setAssets(results);
            } catch (err) {
                console.error('Failed to load wallets info', err);
                if (mounted) setAssets([]);
            } finally {
                if (mounted) setLoadingAssets(false);
            }
        }

        fetchWallets();
        return () => { mounted = false; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletStore && walletStore.wallets]);

    return (
         <div>
            <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#eaeae6"}}>
                {/* back button */}
                <button className="btn btn-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">keyboard_backspace</span>
                </button>
                <h5 className="m-0">Manage & add wallets</h5>
                <button className="btn btn-sm" onClick={() => navigate("/notifications")}>
                    <span class="material-symbols-outlined">siren</span>
                </button>
            </div>
            <div className="p-4">
                {/* Header */}
                <div className="text-center mb-2">
                    <h6 className="">My asstes</h6>
                    <p className="text-muted small mb-0">View and manage your wallets</p>
                </div>

                {/* Wallet List */}
                <div className="flex-grow-1 overflow-auto">
                    {loadingAssets ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <small className="text-muted ms-2">Loading wallets...</small>
                        </div>
                    ) : (
                        (assets.length ? assets : []).map((w) => {
                            const changeClass = (Number(w.change) >= 0) ? 'text-success' : 'text-danger';
                            return (
                                <div
                                    key={w.id}
                                    className="d-flex justify-content-between align-items-center border-bottom py-3"
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                                            style={{ width: 45, height: 45, overflow: 'hidden' }}
                                        >
                                            {w.logo ? (
                                                <img
                                                    src={w.logo}
                                                    alt={w.symbol}
                                                    style={{ width: 36, height: 36, objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentNode;
                                                        if (parent) parent.textContent = w.symbol?.charAt(0) || '•';
                                                    }}
                                                />
                                            ) : (
                                                <div className="fw-bold">{w.symbol?.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="fw-semibold">{w.name}</div>
                                            <div className="text-muted small">{w.symbol} • {shortenAddress(w.address)}</div>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <div className="fw-semibold">{w.price}</div>
                                        <div className={`small ${changeClass}`}>{(w.change || 0).toFixed(2)}%</div>
                                        {/* <div className="small text-muted">Bal: {Number(w.balance || 0)}</div> */}
                                    </div>
                                </div>
                            )
                        })
                    )}

          {/* Add New Wallet Button */}
          <div className="text-center py-4">
            <button
              className="btn btn-outline-primary d-flex align-items-center justify-content-center w-100"
              style={{
                borderRadius: "15px",
                fontWeight: "500",
                padding: "10px 0",
              }}
            >
              <span className="material-symbols-outlined me-2">add_circle</span>
              Add Wallet
            </button>
          </div>
        </div>
              
            </div>
        </div>
    )
}

export default Wallets;