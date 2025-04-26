import React, { useReducer, createContext, useEffect } from 'react'

export const ContactContext = createContext();

function reducer(store, action) {
    let contacts;
    let index;

    switch (action.type) {
        case 'setContacts': 
            return {...store, contacts: action.payload.contacts, total: action.payload.total}
        case 'contactDeleted': 
            index = store.contacts.findIndex(contact => contact.id.toString() === action.payload.toString());
            contacts = store.contacts
            contacts.splice(index, 1);
            return {...store, contacts: contacts, total: store.total - 1}
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
