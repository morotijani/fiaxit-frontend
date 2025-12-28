import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsonGet, jsonPatch, jsonDelete } from '../../helpers/Ajax';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const resp = await jsonGet('notifications');
            if (resp && resp.success) {
                setNotifications(resp.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const resp = await jsonPatch(`notifications/${id}/read`, {});
            if (resp && resp.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const resp = await jsonPatch('notifications/read-all', {});
            if (resp && resp.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                toast.success('All marked as read');
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            const resp = await jsonDelete(`notifications/${id}`);
            if (resp && resp.success) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                toast.success('Notification deleted');
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return { icon: 'check_circle', color: 'text-success' };
            case 'warning': return { icon: 'warning', color: 'text-warning' };
            case 'error': return { icon: 'error', color: 'text-danger' };
            default: return { icon: 'info', color: 'text-primary' };
        }
    };

    return (
        <div className="animate-fade-in pb-5 bg-white" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Notifications</h6>
                <button
                    className="btn btn-light btn-sm rounded-pill fw-bold text-primary px-3 shadow-sm border"
                    onClick={markAllAsRead}
                    disabled={notifications.filter(n => !n.is_read).length === 0}
                >
                    Read All
                </button>
            </div>

            <div className="p-3">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" />
                        <div className="text-muted small mt-2">Loading notifications...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4 border border-dashed mt-4">
                        <span className="material-symbols-outlined text-muted opacity-50" style={{ fontSize: '64px' }}>notifications_off</span>
                        <p className="text-muted mt-3 mb-0 fw-semibold">No notifications yet</p>
                        <p className="text-muted small">We'll notify you when something happens.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-2 mt-2">
                        {notifications.map((n) => {
                            const { icon, color } = getIcon(n.type);
                            const time = n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : '';

                            return (
                                <div
                                    key={n.id}
                                    className={`p-3 rounded-4 border position-relative hover-fade crypto-card ${n.is_read ? 'bg-light' : 'bg-white shadow-sm'}`}
                                    onClick={() => handleNotificationClick(n)}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    {!n.is_read && (
                                        <div
                                            className="position-absolute bg-primary rounded-circle"
                                            style={{ width: '8px', height: '8px', top: '15px', right: '15px' }}
                                        />
                                    )}
                                    <div className="d-flex align-items-start gap-3">
                                        <div className={`rounded-circle bg-light p-2 d-flex align-items-center justify-content-center ${color}`}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{icon}</span>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h6 className={`mb-1 ${n.is_read ? 'text-secondary' : 'fw-bold'}`}>{n.title}</h6>
                                                <button
                                                    className="btn btn-link p-0 text-muted border-0 shadow-none hover-danger"
                                                    onClick={(e) => deleteNotification(e, n.id)}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                </button>
                                            </div>
                                            <p className={`small mb-1 ${n.is_read ? 'text-muted' : 'text-dark'}`}>{n.message}</p>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>{time}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications;
