import React, { useReducer, createContext, useEffect } from 'react'

export const ContactContext = createContext();

function reducer(store, action) {
    let contact;
    let index;

    switch (action.type) {
        case 'setContacts': 
            return {...store, contacts: action.payload.contacts, total: action.payload.total}
        default: 
            return store;
    }
}

export function ContactStore(props) {
    const [store, dispatch] = useReducer(reducer, {total: 0, contacts: []});    

    return (
        <ContactContext.Provider value={[store, dispatch]}>
            {props.children}
        </ContactContext.Provider>
    )
}
