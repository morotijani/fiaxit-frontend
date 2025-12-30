import { useNavigate, useLocation } from 'react-router-dom'

function MainFooter() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { path: '/', label: 'Home', icon: 'home' },
        { path: '/converter', label: 'Converter', icon: 'currency_exchange' },
        { path: '/contacts', label: 'Contacts', icon: 'contact_page' },
        { path: '/transactions', label: 'Activity', icon: 'account_balance_wallet' },
        { path: '/settings', label: 'Settings', icon: 'settings' }
    ];

    return (
        <div className="main-footer border-top py-3 bg-white fixed-bottom w-100 mx-auto" style={{ maxWidth: '440px' }}>
            <div className="d-flex justify-content-around text-center">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <div
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            style={{ cursor: "pointer", flex: 1 }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: '24px',
                                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
                                }}
                            >
                                {tab.icon}
                            </span>
                            <div className="small fw-bold" style={{ fontSize: '10px' }}>{tab.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default MainFooter