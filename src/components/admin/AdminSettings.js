import React from 'react';
import ThemeToggle from '../ThemeToggle';

function AdminSettings() {
    return (
        <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div className="text-center mb-5">
                <h2 className="fw-normal mt-4" style={{ color: '#202124' }}>Settings</h2>
                <p className="text-muted">Manage your dashboard display preferences and system alerts.</p>
            </div>

            <div className="admin-card p-0 overflow-hidden mb-4">
                <div className="p-4 border-bottom">
                    <h5 className="admin-card-title mb-0">Appearance</h5>
                    <p className="admin-card-text">Customize how the Fiaxit Admin console looks on your device.</p>
                </div>

                <div className="list-group list-group-flush">
                    {/* THEME */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between">
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <span className="material-symbols-outlined me-3 text-muted">palette</span>
                                <span className="fw-medium text-dark">Dark Mode</span>
                            </div>
                            <div className="text-muted small ps-5">Adjust the dashboard for better visibility in low light</div>
                        </div>
                        <ThemeToggle />
                    </div>

                    {/* LANGUAGE */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between">
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <span className="material-symbols-outlined me-3 text-muted">language</span>
                                <span className="fw-medium text-dark">Language</span>
                            </div>
                            <div className="text-muted small ps-5">Currently set to English (United States)</div>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>
                </div>
            </div>

            <div className="admin-card p-0 overflow-hidden mb-4">
                <div className="p-4 border-bottom">
                    <h5 className="admin-card-title mb-0">System Alerts</h5>
                    <p className="admin-card-text">Configure how you receive critical platform updates.</p>
                </div>

                <div className="list-group list-group-flush">
                    {/* EMAIL NOTIFICATIONS */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between">
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <span className="material-symbols-outlined me-3 text-muted">mail</span>
                                <span className="fw-medium text-dark">Email notifications</span>
                            </div>
                            <div className="text-muted small ps-5">Get platform health and KYC alerts via email</div>
                        </div>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" defaultChecked style={{ scale: '1.2' }} />
                        </div>
                    </div>

                    {/* DESKTOP NOTIFICATIONS */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between">
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <span className="material-symbols-outlined me-3 text-muted">notifications_active</span>
                                <span className="fw-medium text-dark">Desktop alerts</span>
                            </div>
                            <div className="text-muted small ps-5">Receive instant browser notifications for new transactions</div>
                        </div>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" style={{ scale: '1.2' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center py-4">
                <p className="small text-muted">Fiaxit Admin Console v1.2.0 • Build 2025.12.29</p>
            </div>
        </div>
    );
}

export default AdminSettings;
