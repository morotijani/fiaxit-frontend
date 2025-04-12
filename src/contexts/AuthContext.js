import React, {createContext, useReducer} from 'react';

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
    return (
        // provide information down to our children
        <AuthContext.Provider  value={[store, dispatch]}>
            {props.children}
        </AuthContext.Provider>
    )
}