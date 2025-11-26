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
        case 'updateUser':
            return {...store, user: {...store.user, ...action.payload}}
        case 'updateUserBalance':
            return {...store, user: {...store.user, ...action.payload}}
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
        user: {}, 
        balance: {}
    });

    useEffect(() => {
        if (store.loggedIn && !store.user.hasOwnProperty('id')) {
            getUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [store.loggedIn]) // anytime store.loggedIn is changed then we want to call getUser()

    //
     async function getUser() {
        // check if isloggedin and make sure we don't already have it to save some api calls
        if (store.loggedIn && !store.user.hasOwnProperty('id')) {
            try {
                const resp = await jsonGet('auth/loggedInUser');
                if (resp && resp.success) {
                    dispatch({type: "setUser", payload: resp.data})
                    // pass fetched user into getUserBalance to avoid reading stale store
                    // const balance = await getUserBalance(resp.data);
                    // if (balance) {
                    //     dispatch({type: "updateUserBalance", payload: {balance: balance}});
                    // }
                }
            } catch (err) {
                console.error('getUser error', err);
            }
        }
        return store.user;
    }

    // get user balance from all wallet address
    // accepts optional user param to avoid relying on stale store after dispatch
    // async function getUserBalance(user = null) {
    //     try {
    //         if (!store.loggedIn) return null;
    //         // if a specific user object provided, prefer it for any validations (not strictly required here)
    //         // call API to retrieve balances for logged in user
    //         const resp = await jsonGet('wallets/balance');
    //         if (resp && resp.success) {
    //             return resp.data;
    //         }
    //         return null;
    //     } catch (err) {
    //         console.error('getUserBalance error', err);
    //         return null;
    //     }
    // }

    return (
        // provide information down to our children
        // expose getUser and getUserBalance so consumers can refresh when needed
        // <AuthContext.Provider  value={[store, dispatch, getUser, getUserBalance]}>
        <AuthContext.Provider  value={[store, dispatch, getUser]}>
            {props.children}
        </AuthContext.Provider>
    )
}