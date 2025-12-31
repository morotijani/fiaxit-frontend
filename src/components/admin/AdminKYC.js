import React, { useState, useEffect } from 'react';
import { jsonGet, jsonPatch } from '../../helpers/Ajax';

function AdminKYC() {
    const [pendingKyc, setPendingKyc] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKyc, setSelectedKyc] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [assignedTier, setAssignedTier] = useState(2); // Default to ID Verified (Tier 2)

    const apiBase = process.env.REACT_APP_API || 'http://localhost:8000/v1/';
    const baseUrl = apiBase.replace('/v1/', '/');

    const fetchPending = async () => {
        try {
            setLoading(true);
            const resp = await jsonGet('admin/users?kycStatus=pending');
            if (resp && resp.success) {
                setPendingKyc(resp.data);
            }
        } catch (err) {
            console.error("Fetch KYC error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleVerify = async (userId, status) => {
        try {
            setProcessing(true);
            const resp = await jsonPatch(`user/kyc/verify/${userId}`, {
                status,
                tier: assignedTier,
                reason: status === 'rejected' ? rejectionReason : null
            });

            if (resp && resp.success) {
                setSelectedKyc(null);
                setRejectionReason('');
                setAssignedTier(2);
                fetchPending();
            } else {
                alert(resp?.message || "Operation failed");
            }
        } catch (err) {
            console.error("KYC verification error:", err);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="mb-4">
                <h2 className="fw-normal" style={{ color: '#202124' }}>Security verification</h2>
                <p className="text-muted small">Verify user identities to maintain a secure and trusted platform environment.</p>
            </div>

            <div className="row g-4">
                {/* List of Pending */}
                <div className="col-lg-4">
                    <div className="admin-card p-0 overflow-hidden h-100">
                        <div className="p-3 border-bottom bg-light bg-opacity-10 d-flex align-items-center">
                            <span className="material-symbols-outlined me-2 text-muted" style={{ fontSize: '20px' }}>list</span>
                            <span className="fw-medium small">Pending requests ({pendingKyc.length})</span>
                        </div>
                        <div className="list-group list-group-flush">
                            {pendingKyc.map(u => (
                                <button
                                    key={u.user_id}
                                    className={`list-group-item list-group-item-action border-0 py-3 px-4 d-flex align-items-center ${selectedKyc?.user_id === u.user_id ? 'bg-primary bg-opacity-10' : ''}`}
                                    onClick={() => setSelectedKyc(u)}
                                >
                                    <div className="bg-light rounded-circle me-3 d-flex align-items-center justify-content-center border" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>person</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="fw-medium text-dark text-truncate">{u.user_fname} {u.user_lname}</div>
                                        <div className="text-muted small text-truncate" style={{ fontSize: '11px' }}>{u.user_email}</div>
                                    </div>
                                    {selectedKyc?.user_id === u.user_id && (
                                        <span className="material-symbols-outlined ms-auto text-primary" style={{ fontSize: '18px' }}>chevron_right</span>
                                    )}
                                </button>
                            ))}
                            {pendingKyc.length === 0 && (
                                <div className="p-5 text-center text-muted">
                                    <span className="material-symbols-outlined d-block mb-2 text-secondary opacity-25" style={{ fontSize: '48px' }}>verified</span>
                                    <div className="small">All caught up! No requests.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Verification Detail */}
                <div className="col-lg-8">
                    {selectedKyc ? (
                        <div className="admin-card animate-slide-up">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                    <span className="material-symbols-outlined text-primary">fact_check</span>
                                </div>
                                <div>
                                    <h3 className="admin-card-title mb-0">Identity review</h3>
                                    <p className="admin-card-text mb-0">Request submitted on {new Date(selectedKyc.kyc_submitted_at || selectedKyc.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="mb-2 small fw-medium text-muted">ID DOCUMENT (FRONT)</div>
                                    <div className="bg-light rounded-2 overflow-hidden border" style={{ height: '240px' }}>
                                        <img
                                            src={`${baseUrl}${selectedKyc.kyc_document_front || 'public/placeholder.png'}`}
                                            className="w-100 h-100 object-fit-contain"
                                            alt="ID Front"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Document'}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2 small fw-medium text-muted">SELFIE PHOTO</div>
                                    <div className="bg-light rounded-2 overflow-hidden border" style={{ height: '240px' }}>
                                        <img
                                            src={`${baseUrl}${selectedKyc.kyc_selfie || 'public/placeholder.png'}`}
                                            className="w-100 h-100 object-fit-contain"
                                            alt="Selfie"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Photo'}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-light bg-opacity-50 rounded-2 border mb-4">
                                <div className="row g-4">
                                    <div className="col-sm-4">
                                        <div className="small text-muted mb-1 text-uppercase fw-medium" style={{ fontSize: '10px' }}>ID TYPE</div>
                                        <div className="fw-medium text-uppercase text-dark">{selectedKyc.kyc_id_type || 'N/A'}</div>
                                    </div>
                                    <div className="col-sm-4">
                                        <div className="small text-muted mb-1 text-uppercase fw-medium" style={{ fontSize: '10px' }}>ID NUMBER</div>
                                        <div className="fw-medium text-dark">{selectedKyc.kyc_id_number || 'N/A'}</div>
                                    </div>
                                    <div className="col-sm-4">
                                        <div className="small text-muted mb-1 text-uppercase fw-medium" style={{ fontSize: '10px' }}>COUNTRY</div>
                                        <div className="fw-medium text-dark">{selectedKyc.kyc_country || 'N/A'}</div>
                                    </div>
                                    <div className="col-12">
                                        <div className="small text-muted mb-1 text-uppercase fw-medium" style={{ fontSize: '10px' }}>FULL ADDRESS</div>
                                        <div className="fw-medium text-dark">{selectedKyc.kyc_address}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 border-top pt-4">
                                <h4 className="fw-medium mb-3" style={{ fontSize: '1rem' }}>Final decision</h4>
                                <div className="mb-4">
                                    <textarea
                                        className="form-control border shadow-none p-3"
                                        rows="2"
                                        placeholder="Add a reason if you're rejecting this request..."
                                        style={{ fontSize: '0.875rem' }}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="mb-4 d-flex align-items-center bg-white p-3 rounded border">
                                    <div className="me-4 flex-shrink-0">
                                        <div className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Assign KYC Tier</div>
                                        <div className="small text-muted">Determine user limits</div>
                                    </div>
                                    <select
                                        className="form-select border-0 bg-light shadow-none fw-medium"
                                        value={assignedTier}
                                        onChange={(e) => setAssignedTier(parseInt(e.target.value))}
                                        disabled={processing}
                                    >
                                        <option value={2}>Tier 2 (ID Verified - $10,000 Limit)</option>
                                        <option value={3}>Tier 3 (Proof of Address - Unlimited)</option>
                                    </select>
                                </div>

                                <div className="d-flex gap-3 justify-content-end">
                                    <button
                                        className="btn btn-link text-danger text-decoration-none fw-medium p-0 px-3"
                                        disabled={processing || !rejectionReason}
                                        onClick={() => handleVerify(selectedKyc.user_id, 'rejected')}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        className="admin-btn-primary"
                                        disabled={processing}
                                        onClick={() => handleVerify(selectedKyc.user_id, 'verified')}
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="admin-card h-100 d-flex align-items-center justify-content-center p-5 text-center text-muted border-dashed bg-light bg-opacity-10">
                            <div>
                                <span className="material-symbols-outlined d-block mb-3 opacity-10" style={{ fontSize: '120px' }}>fact_check</span>
                                <h5 className="fw-normal text-dark">Review documents</h5>
                                <p className="small mb-0">Select a pending identity request to view documents and make a verification decision.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminKYC;
