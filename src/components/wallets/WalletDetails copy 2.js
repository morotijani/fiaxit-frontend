import { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonGet } from '../../helpers/Ajax'
import { shortenAddress } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';

function WalletDetails() {
    const navigate = useNavigate();
    let { id } = useParams()
    const [walletStore, walletDispatch] = useContext(WalletContext);

    // find wallet by id from url param
    async function fetchWalletById(id) {
        const resp = await jsonGet(`wallets/${id}`);
        if (resp.success) {
            // walletDispatch({type: 'setCurrentWallet', payload: resp.wallet}) // there something here
            return resp;
        } else {
            navigate('/wallets');
            toast.failed('Wallet not found !', {duration: 6000});
        }
    }

    // on component load, fetch wallet details
    const [assets, setAssets] = useState([]);
    const [loadingWallet, setLoadingWallet] = useState(true);

    useEffect(() => {
        (async function startup() {
            // const pathParts = window.location.pathname.split('/');
            // const walletId = pathParts[pathParts.length -  1];
            let mounted = true;
            const w = await fetchWalletById(id);
           //  console.log('heat', storeWallets);
            //const jobs = storeWallets.map(async (w) => {
                const symbol = (w.wallet_crypto || '').toLowerCase();
                const address = w.wallet_address || '';

                // fetch wallet info
                const infoPromise = jsonGet(`wallets/${symbol}/${address}/info`);
                const infoResp = await infoPromise;
                const infoData = infoResp?.data ?? null;
                return {
                    ...w, 
                    rawInfo: infoData,
                    address,
                    wallet_id: w.wallet_id
                };
            // });

          //  Promise.all(jobs).then((results) => {
                if (mounted) {
                    setAssets(results);
                    setLoadingWallet(false);
                }
    // });

            return () => {
                mounted = false;
            };
        })();
            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    return (
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">keyboard_backspace</span>
                </button>
                    <h6 className="mb-0">069e5681-409d-467f-bc88-ad6c5d91c798</h6>
                    <button className="btn btn-light btn-sm" onClick={() => navigate('/deposit')}>
                        Deposit
                    </button>
                </div>

                {loadingWallet ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <small className="text-muted ms-2">Loading tokens...</small>
                        </div>
                    ) : (
                        
                        (assets.length ? assets : []).map((t) => {
                            const changeClass = (t.change >= 0) ? 'text-success' : 'text-danger';
                            return (
                                <div>
                                    every goes here
                                    </div>
                            )
                        })
                    )}
                    <hr />
                    <hr />
                <div className="text-center text-muted small mt-2">
                    <span className="badge bg-dark bg-opacity-10 text-dark rounded-pill px-3 py-2">
                        0x9e523429...34c7 <i className="bi bi-back"></i>
                    </span>
                </div>
            
                    {/* Balance */}
                    <div className="text-center my-3">
                        <h3 className="fw-bold">$76,297.32</h3>
                        <div className="text-success small fw-semibold">+ $56.17 (+0.67%)</div>
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
            
            <div className="p-4">
                {/* Header */}
                <div className="text-center mb-2">
                    <h6 className="">
                        My wallet &nbsp;
                        <span className="badge rounded-pill bg-dark">{walletStore.total}</span>
                    </h6>
                    <p className="text-muted small mb-0">View and manage your wallets</p>
                </div>

            </div>
        </div>
    )
}

export default WalletDetails;