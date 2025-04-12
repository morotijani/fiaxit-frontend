import React, {createContext, useReducer} from 'react';
import {jsonGet} from '../helpers/Ajax'

export const AuthContext = createContext();

function reducer(store, action) {
    switch(action.type) {
        case 'login': 
            localStorage.setItem(store.tokenName, action.payload);
            return {...store, loggedIn: true}
        default: return store;
    }
}

export function AuthStore(props) {
    const [store, dispatch] = useReducer(reducer, {
        tokenName: "userJWTToken", 
        loggedIn: (localStorage.getItem('userJWTToken') !== null), 
        user: {}
    });

    //
    async function getUser() {
        // check if isloggedin and make sure we don't already have it to save some api calls
        if (store.loggedIn && !store.user.hasOwnProperty('id')) {
            const resp = await jsonGet('auth/loggedInUser')
        }
    }

    return (
        // provide information down to our children
        <AuthContext.Provider  value={[store, dispatch]}>
            {props.children}
        </AuthContext.Provider>
    )
}