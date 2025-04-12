import {useState, useContext} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock'
import {Form} from '../../helpers/Form'
import Button from '../elements/Button'
import {AuthContext} from "../../contexts/AuthContext"

function Login() {
    const history = useNavigate();
    const [fields, setFields] = useState({
        email: {value: "", isInvalid: false, msg: ""},
        password: {value: "", isInvalid: false, msg: ""}
    });

    const [authStore, authDispatch] = useContext(AuthContext)

    async function success(resp) {
        authDispatch({type: 'login', payload: resp.token});
        console.log(authStore);
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
                label="Password:" type="password" isInvalid={fields.password.isInvalid} feedback={fields.password.msg}
            />
            <div className="l_footer_buttons d-flex justify-content-between align-items-center">
                <Link to="/auth/signup">Register</Link>
                <Button variant="primary" onClick={form.submitForm}>Log in</Button>
            </div>
        </div>
    );
}

export default Login;