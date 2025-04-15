import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock';
import { Form } from '../../helpers/Form';
import Button from '../elements/Button';

function Signup() {
    const navigate = useNavigate();
    const [fields, setFields] = useState({
        fname: {value: "", isInvalid: false, msg: ""}, 
        fname: {value: "", isInvalid: false, msg: ""}, 
        lname: {value: "", isInvalid: false, msg: ""}, 
        email: {value: "", isInvalid: false, msg: ""}, 
        phone: {value: "", isInvalid: false, msg: ""}, 
        password: {value: "", isInvalid: false, msg: ""}, 
        confrim_password: {value: "", isInvalid: false, msg: ""}, 
    })
}