import { useNavigate } from 'react-router-dom'

function MainFooter(props) {
    const navigate = useNavigate();

    const handleHomeLinkClick = () => {
        navigate('/');
    }
    
    const handleConverterLinkClick = () => {
        navigate('/converter');
    }
    
    const handleActivityLinkClick = () => {
        navigate('/activity');
    }
    
    const handleConverterSettingsClick = () => {
        navigate('/settings');
    }

    return (
        <div className="border-top py-2 bg-white main-footer">
            <div className="d-flex justify-content-around text-center">
                <div onClick={handleHomeLinkClick} style={{ cursor: "pointer" }}>
                    <span class="material-symbols-outlined">cottage</span>
                    <br />
                    <small>Home</small>
                </div>
                <div onClick={handleConverterLinkClick} style={{ cursor: "pointer" }}>
                    <span class="material-symbols-outlined">currency_exchange</span>
                    <br />
                    <small>Converter</small>
                </div>
                <div onClick={handleActivityLinkClick} style={{ cursor: "pointer" }}>
                    <span class="material-symbols-outlined">equalizer</span>
                    <br />
                    <small>Activity</small>
                </div>
                <div onClick={handleConverterSettingsClick} style={{ cursor: "pointer" }}>
                    <span class="material-symbols-outlined">rule_settings</span>
                    <br />
                    <small>Settings</small>
                </div>
            </div>
        </div>
    )
}

export default MainFooter