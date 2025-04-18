import React, { useReducer, createContext, useEffect } from 'react'
import { stringToBoolean } from '../helpers/StringHelpers'

export const TodoContext = createContext();

function reducer(store, action) {
    let todos;
    let index;
    switch(action.type) {
        case 'AddTodo':
            todos = store.todos;
            todos.push(action.payload)
            return {...store, todos: todos, dirty: true}
        default: 
            return store;
    }
}

export function TodoStore(props) {

    const [store, dispatch] = useReducer(reducer, {total: 0, todos: [], incomplete: 0, dirty: false});
    
    return (
        <TodoContext.Provider value={[store, dispatch]}>
            {props.children}
        </TodoContext.Provider>
    )
}