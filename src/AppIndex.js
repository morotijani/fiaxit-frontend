import React, {useState, useEffect} from 'react';
import MainNav from './components/MainNav';
import FieldBlock from './components/elements/FieldBlock';
import {Form} from './helpers/Form';

function AppIndex() {
    
    const [fields, setFields] = useState({
        email: {value: "", isInvalid: false, msg: ""}, 
        password: {value: "", isInvalid: false, msg: ""}
    });

    async function success(resp) {
        console.log(resp);
    }

    const form = new Form('auth/login', fields, setFields, success)
  
    return(
        <main className="app">
            <MainNav />
            <div className="main-content">
                <h2>Your api domain is: {process.env.REACT_APP_API}</h2>
               <FieldBlock
                    id="email" value={fields.email.value} onChange={form.handleInputChanges} 
                    label="Username:" isInvalid={fields.email.isInvalid} feedback={fields.email.msg}
               />
               <FieldBlock
                    id="password" value={fields.password.value} onChange={form.handleInputChanges}
                    label="Password:" type="password" isInvalid={fields.password.isInvalid} feedback={fields.password.msg}
               />
               
            </div>
            
        </main>
    );
}

export default AppIndex;