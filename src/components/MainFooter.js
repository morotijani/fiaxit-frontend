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
                    <i className="bi bi-house"></i>
                    <br />
                    <small>Home</small>
                </div>
                <div onClick={handleConverterLinkClick} style={{ cursor: "pointer" }}>
                    <i className="bi bi-transparency"></i>
                    <br />
                    <small>Converter</small>
                </div>
                <div onClick={handleActivityLinkClick} style={{ cursor: "pointer" }}>
                    <i className="bi bi-graph-up-arrow"></i>
                    <br />
                    <small>Activity</small>
                </div>
                <div onClick={handleConverterSettingsClick} style={{ cursor: "pointer" }}>
                    <i className="bi bi-gear-wide-connected"></i>
                    <br />
                    <small>Settings</small>
                </div>
            </div>
        </div>
    )
}

export default MainFooter