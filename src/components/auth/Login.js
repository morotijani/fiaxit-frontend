import {useState, useContext} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock'
import {Form} from '../../helpers/Form'
import Button from '../elements/Button'
import {AuthContext} from "../../contexts/AuthContext"
import toast from 'react-hot-toast';

function Login() {
    const navigate = useNavigate();
    const [fields, setFields] = useState({
        email: {value: "", isInvalid:false, msg: ""},
        password: {value: "", isInvalid:false, msg: ""}
    });

    const [, authDispatch, getUser] = useContext(AuthContext)

    async function success(resp) {
        authDispatch({type: 'login', payload: resp.token});
        await getUser()
        navigate('/'); // redirect to main page or root directory after loggedin
        toast.success("You have been logged in successfully", {duration: 6000});
    }

    const form = new Form('auth/login', fields, setFields, success);

    return(
        <div>
            <h2>Login</h2>
             <FieldBlock
                id="email" value={fields.email.value} onChange={form.handleInputChanges} 
                label="Username:" isInvalid={fields.email.isInvalid} feedback={fields.email.msg}
            />
            <FieldBlock
                id="password" value={fields.password.value} onChange={form.handleInputChanges}
                label="Password:" type="password" feedback={fields.password.msg} isInvalid={fields.password.isInvalid}
            />
            <div className="l_footer_buttons d-flex justify-content-between align-items-center">
                <Link to="/auth/signup">Register</Link>
                <Button variant="primary" onClick={form.submitForm}>Log In</Button>
            </div>
        </div>
    );
}

export default Login;