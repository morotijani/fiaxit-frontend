import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { jsonGet, jsonDelete } from '../../helpers/Ajax';
import toast from 'react-hot-toast';

function SessionsSettings() {
    const navigate = useNavigate();
    const [authStore] = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await jsonGet('user/sessions');
            if (res.success) {
                setSessions(res.data);
            }
        } catch (err) {
            toast.error('Failed to load active sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm('Are you sure you want to log out this device?')) return;
        try {
            const res = await jsonDelete(`user/sessions/${id}`);
            if (res.success) {
                toast.success('Session revoked');
                setSessions(sessions.filter(s => s.session_id !== id));
            }
        } catch (err) {
            toast.error('Failed to revoke session');
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    const isCurrentSession = (session) => {
        // Simple heuristic: match IP and user agent
        // In a real app, we'd use a unique session ID in the JWT or a cookie
        return false; // Placeholder for now
    };

    return (
        <div className="animate-fade-in">
            {/* Top Handle */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Active Sessions</h6>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="p-4">
                <div className="mb-4">
                    <h5 className="fw-bold mb-1">Login Activity</h5>
                    <p className="text-muted small">You're currently logged in on these devices.</p>
                </div>

                {loading && sessions.length === 0 ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : (
                    <div className="list-group rounded-4 border shadow-sm">
                        {sessions.map(session => (
                            <div key={session.session_id} className="list-group-item p-3 border-0 border-bottom d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center overflow-hidden">
                                    <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                        <span className="material-symbols-outlined text-primary">
                                            {session.device_name?.toLowerCase().includes('iphone') || session.device_name?.toLowerCase().includes('android') ? 'smartphone' : 'desktop_windows'}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="fw-bold small d-flex align-items-center">
                                            {session.device_name || 'Unknown Device'}
                                            {isCurrentSession(session) && <span className="badge bg-success-subtle text-success ms-2" style={{ fontSize: '0.65rem' }}>Current</span>}
                                        </div>
                                        <div className="text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>
                                            {session.ip_address} • Last active: {formatDate(session.last_active)}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-outline-danger btn-sm rounded-pill px-3 ms-2" onClick={() => handleRevoke(session.session_id)}>
                                    Log Out
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 p-3 bg-light rounded-4 border">
                    <div className="d-flex align-items-start text-muted">
                        <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>info</span>
                        <small style={{ fontSize: '0.75rem' }}>
                            If you see a device you don't recognize, we recommend changing your password immediately.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionsSettings;
