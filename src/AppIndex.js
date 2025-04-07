import React, {useState, useEffect} from 'react';
import MainNav from './components/MainNav';
import FieldBlock from './components/elements/FieldBlock';
import {Form} from './helpers/Form';

function AppIndex() {
    
    const [fields, setFields] = useState({
        emil: {value: "", isInvalid: false, msg: ""}, 
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
                    id="username" value={username} onChange={(evt) => {setUsername(evt.target.value)}} 
                    label="Username:"
               />
               <FieldBlock
                    id="password" value={password} onChange={(evt) => setPassword(evt.target.value)}
                    label="Password:" type="password" feedback="must be 8 characters" isInvalid={true}
               />
               
            </div>
            
        </main>
    );
}

export default AppIndex;