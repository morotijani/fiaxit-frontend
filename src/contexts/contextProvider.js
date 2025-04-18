import React from 'react';
import {AuthStore} from './AuthContext';
import { TodoStore } from './TodoContext'
import { Toaster } from 'react-hot-toast';


function ContextProvider(props) {
    return(
        <AuthStore>
            <TodoStore>
                {props.children}
                <Toaster position="bottom-center" />
            </TodoStore>
        </AuthStore>
    );
} 

export default ContextProvider;