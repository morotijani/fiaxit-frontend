import React, { useReducer, createContext } from 'react'

export const TransactionContext = createContext();

function reducer(store, action) {
    let transactions;
    let index;

    switch (action.type) {
        case 'AddTransaction': 
            return {...store, transactions: [...store.transactions, action.payload]};
        case 'TransactionUpdated': 
            index = store.transactions.findIndex((t) => t.id === action.payload.id);
            transactions = [...store.transactions];
            transactions[index] = action.payload;
            return {...store, transactions: transactions};
        case 'TransactionDeleted': 
            transactions = store.transactions.filter((t) => t.id !== action.payload);
            return {...store, transactions: transactions};
        case 'setTransactions': 
            return {...store, transactions: action.payload.transactions, total: action.payload.total}
        default: 
            return store;
    }
}

export function TransactionStore(props) {
    const [store, dispatch] = useReducer(reducer, {total: 0, transactions: []});    

    return (
        <TransactionContext.Provider value={[store, dispatch]}>
            {props.children}
        </TransactionContext.Provider>
    )
}


