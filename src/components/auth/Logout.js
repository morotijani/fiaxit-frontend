import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'
import { jsonGet } from '../../helpers/Ajax'
import Button from '../elements/Button'
import toast from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function Logout() {
    const navigate = useNavigate();
    const [, authDispatch] = useContext(AuthContext);

    async function logout() {
        const resp = await jsonGet('auth/logout');
        if (resp.success) {
            authDispatch({ type: 'logout' });
            navigate('/auth/login');
            toast.success("You have been logged out successfully.", { duration: 6000 });
        } else {
            console.error('Logout failed:', resp.errors.message)
            toast.error(`An error occurred while logging out. Please try again.`, { duration: 6000 });
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div className="card shadow-lg border-0 p-4 main-card-container">

                    {/* Top Handle for App-like feel */}
                    <div className="mb-4 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>

                    {/* Logo & Header */}
                    <div className="text-center">
                        <img className="img-fluid mb-4" src={Logo} alt="Fiaxit" style={{ height: "40px" }} />
                        <h3 className="fw-700 mb-2" style={{ letterSpacing: '-1px' }}>Logging out?</h3>
                        <p className="text-muted px-2">You're about to log out. Your progress is saved and we'll be here when you return.</p>
                    </div>

                    {/* Illustration */}
                    <div className="d-flex justify-content-center my-4 py-2">
                        <div className="bg-light rounded-circle p-4 d-flex align-items-center justify-content-center shadow-inner" style={{ width: '180px', height: '180px' }}>
                            <img
                                src="https://blush.design/api/download?shareUri=YLrH0N7qjk8qx26d&c=Hair_0%7Eff5290_Skin_0%7E715b4c&w=800&h=800&fm=png"
                                alt="Logout Illustration"
                                className="img-fluid"
                                style={{ width: "140px", height: "auto" }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="d-grid gap-3 px-2">
                        <button
                            className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                            onClick={logout}
                        >
                            <span className="material-symbols-outlined me-2">logout</span>
                            Yes, Log me out
                        </button>
                        <button
                            className="btn btn-light rounded-pill py-3 fw-bold border"
                            onClick={() => navigate("/")}
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="text-muted text-center small mt-5 px-3 pb-2 opacity-75">
                        We value your security. By logging out, we ensure your session is terminated safely. See our{" "}
                        <Link to="/terms" className="text-decoration-none fw-semibold">Terms</Link>{" "} &{" "}
                        <Link to="/privacy-policy" className="text-decoration-none fw-semibold">Privacy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Logout;