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
            authDispatch({type: 'logout'});
            navigate('/auth/login');
            toast.success("You have been logged out successfully.", {duration: 6000});
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div
                    className="card shadow-sm border-0 p-4"
                    style={{
                        width: "460px",
                        borderRadius: "25px",
                        minHeight: "90vh",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    {/* top bar */}
                    <div className="mb-3 mx-auto" style={{ width: "50%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "2px" }}></div>

                    {/* Heading */}
                    <img className="img-fluid" src={Logo} alt="" width="72" height="35"></img>
                    <div className="mt-4">
                        <h4 className="fw-bold">Logout of your Fiaxit account.</h4>
                        <p className="text-muted mb-4">You're about to log out from your account. Don't worry - your savings and progress are safe. You can log back in anytime. </p>
                    </div>
                    {/* Top Section */}
                    <div>
                        {/* Illustration */}
                        <div className="d-flex justify-content-center mt-3">
                            <img
                            src="https://blush.design/api/download?shareUri=YLrH0N7qjk8qx26d&c=Hair_0%7Eff5290_Skin_0%7E715b4c&w=800&h=800&fm=png"
                            alt="Meditation Illustration" className="img-fluid"
                            style={{ width: "300px", height: "auto" }}
                            />
                        </div>

                        <div className="d-flex justify-content-between">
                            <Button className="btn btn-light flex-grow-1 me-3" onClick={logout}>
                                Yes Please
                            </Button>
                            <Button className="btn btn-dark flex-grow-1">
                                Not Now
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-muted small mt-4 px-3 pb-2">
                        We care about your data. By logging out, we promise your data is saved with us alone. See our{" "}
                        <Link to="/terms" className="text-decoration-none fw-semibold">Terms</Link>{" "} and{" "}<Link to="/privacy-policy" className="text-decoration-none fw-semibold"> Privacy Policy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Logout;