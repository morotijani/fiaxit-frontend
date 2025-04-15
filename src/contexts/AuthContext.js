import React, {createContext, useReducer, useEffect} from 'react';
import { jsonGet } from '../helpers/Ajax'

export const AuthContext = createContext();

function reducer(store, action) {
    switch(action.type) {
        case 'login': 
            localStorage.setItem(store.tokenName, action.payload);
            return {...store, loggedIn: true}
        case 'setUser': 
            return {...store, user: action.payload}
        case 'isLoggedIn': 
            const loggedIn = localStorage.getItem(store.tokenName) !== null
            return {...store, loggedIn: loggedIn} // return store and update loggedIn
        case 'logout': 
            localStorage.removeItem(store.tokenName);
            return {...store, loggedIn: false, user: {}}
        default: return store;
    }
}

export function AuthStore(props) {
    const [store, dispatch] = useReducer(reducer, {
        tokenName: "userJWTToken", 
        loggedIn: (localStorage.getItem('userJWTToken') !== null), 
        user: {}
    });

    useEffect(() => {
        if (store.loggedIn && !store.user.hasOwnProperty('id')) {
            getUser();
        }
    }, [store.loggedIn]) // anytime store.loggedIn is changed then we want to call getUser()

    //
    async function getUser() {
        // check if isloggedin and make sure we don't already have it to save some api calls
        if (store.loggedIn && !store.user.hasOwnProperty('id')) {
            const resp = await jsonGet('auth/loggedInUser');
            if (resp.success) {
                dispatch({type: "setUser", payload: resp.data})
            }
        }
        return store.user;
    }

    return (
        // provide information down to our children
        <AuthContext.Provider  value={[store, dispatch, getUser]}>
            {props.children}
        </AuthContext.Provider>
    )
}