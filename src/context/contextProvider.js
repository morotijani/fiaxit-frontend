import React from 'react';
import {AuthStore} from './AuthContext';

function ContextProvider(props) {
    return (
        <AuthStore>
            {props.children}
        </AuthStore>
    );
}

export default ContextProvider;