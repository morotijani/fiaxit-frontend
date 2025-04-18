import React, { useReducer, createContext, useEffect } from 'react'
import { stringToBoolean } from '../helpers/StringHelpers'

export const TodoContext = createContext();

function reducer(store, action) {
    
}

export function TodoStor(props) {
    return (
        <TodoContext.Provider value={[]}>
            {props.children}
        </TodoContext.Provider>
    )
}