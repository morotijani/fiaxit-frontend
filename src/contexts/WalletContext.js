import React, { useReducer, createContext } from 'react'

export const WalletContext = createContext();

function reducer(store, action) {
    let wallets;
    let index;

    switch (action.type) {
        case 'AddTransaction': 
            return {...store, wallets: [...store.wallets, action.payload]}; 
        case 'walletInfoViewed': 
            index = store.wallets.findIndex((w) => w.wallet_id === action.payload.wallet_id);
            wallets = [...store.wallets];
            wallets[index] = {...wallets[index], rawInfo: action.payload.info};
            return {...store, wallets: wallets};
        case 'TransactionUpdated': 
            index = store.wallets.findIndex((w) => w.id === action.payload.id);
            wallets = [...store.wallets];
            wallets[index] = action.payload;
            return {...store, wallets: wallets};
        case 'TransactionDeleted': 
            wallets = store.wallets.filter((w) => w.id !== action.payload);
            return {...store, wallets: wallets};
        case 'setWallets': 
            return {...store, wallets: action.payload.wallets, total: action.payload.total}
        default: 
            return store;
    }
}

export function WalletStore(props) {
    const [store, dispatch] = useReducer(reducer, {total: 0, wallets: []});    

    return (
        <WalletContext.Provider value={[store, dispatch]}>
            {props.children}
        </WalletContext.Provider>
    )
}