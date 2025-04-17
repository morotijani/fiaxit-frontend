import React from 'react';
import {AuthStore} from './AuthContext';
import { Toaster } from 'react-hot-toast';


function ContextProvider(props) {
    return(
        <AuthStore>
            {props.children}
            <Toaster position="bottom-center" />
        </AuthStore>
    );
} 

export default ContextProvider;