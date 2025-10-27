import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { jsonGet } from '../../helpers/Ajax'
import { Switch } from 'antd'
import ThemeToggle from '../ThemeToggle';
import toast from 'react-hot-toast';

function Profile() {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(true);
    const [biometric, setBiometric] = useState(false);
    const [authStore, authDispatch] = useContext(AuthContext);
    const fullName = authStore.user ? authStore.user.user_fname + ' ' + authStore.user.user_mname  + ' ' + authStore.user.user_lname : 'Stranger';


    async function logout() {
        const resp = await jsonGet('auth/logout');
        if (resp.success) {
            authDispatch({type: 'logout'});
            navigate('/auth/login');
            toast.success("You have been logged out successfully.", {duration: 6000});
        }
    }

    const settingsLink = () => {
        navigate('/settings');
    }
    
    const changePasswordLink = () => {
        navigate('/change-password');
    }
    
    const changePinLink = () => {
        navigate('/change-pin');
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#eaeae6"}}>
                {/* back button */}
                <button className="btn btn-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">keyboard_backspace</span>
                </button>
                <h5 className="m-0">Profile & Settings</h5>
                <button className="btn btn-sm" onClick={() => navigate("/notifications")}>
                    <span class="material-symbols-outlined">siren</span>
                </button>
            </div> 

            {/* Profile Section */}
            {/* <div className="p-4" style={{ backgroundColor: "#cfd2c2"}}> */}
            <div className="p-4">
                <h6 className="text-muted mb-2">Profile</h6>
                <div className="list-group rounded-4 overflow-hidden">
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Name</span>
                        <span className="text-secondary">{ fullName.toUpperCase() }</span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Email</span>
                        <span className="text-secondary">{ authStore.user.user_email }</span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Phone</span>
                        <span className="text-secondary">{ authStore.user.user_phone || 'N/A' }</span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Joined Date</span>
                        <span className="text-secondary">{ authStore.user.createdAt } </span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Invitation Code</span>
                        <span className="text-secondary"> { authStore.user.user_invitationcode } <span class="material-symbols-outlined">content_copy</span></span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Verification Status</span>
                        <span className="text-secondary"> { authStore.user.user_verified ? 'Verified' : 'Not verified' }</span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Transaction History</span>
                        <span className="text-secondary" onClick={() => navigate('/activity')}>View <span class="material-symbols-outlined">arrow_right</span></span>
                    </button>
                </div>

                {/* App Section */}
                <h6 className="text-muted mt-4 mb-2">App</h6>
                <div className="list-group rounded-4 overflow-hidden">
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Launch Screen</span>
                        <span className="text-secondary" onClick={() => navigate('/')}>Home <span class="material-symbols-outlined">arrow_right</span></span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Language</span>
                        <span className="text-secondary">English <span class="material-symbols-outlined">arrow_right</span></span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Default Currencies</span>
                        <span className="text-secondary">USD & BTC <span class="material-symbols-outlined">arrow_right</span></span>
                    </button>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Dark Mode</span>
                        <ThemeToggle />
                    </div>
                </div>
                
                {/* Security Section */}
                <h6 className="text-muted mt-4 mb-2">Security</h6>
                <div className="list-group rounded-4 overflow-hidden">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Unlock with Biometric</span>
                        <Switch checked={biometric} onChange={setBiometric} />
                    </div>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={settingsLink}>
                        <span>Settings</span>
                        <span><span class="material-symbols-outlined">edit</span></span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={changePasswordLink}>
                        <span>Change password</span>
                        <span><span class="material-symbols-outlined">arrow_right</span></span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={changePinLink}>
                        <span>Change Pin</span>
                        <span><span class="material-symbols-outlined">arrow_right</span></span>
                    </button>
                    <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-danger" onClick={logout}>
                        <span>Logout</span>
                        <span><span class="material-symbols-outlined">chip_extraction</span></span>
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Profile;