import React from 'react'
import TodoList from './TodoList'
import TodoForm from './TodoForm'

function Todos() {
    return (
        <div>
            <h1>My todos</h1>
            <div className="d-flex justify-content-between align-items-start flex-wrap flex-gap-32">
                <TodoList />
                <TodoForm />
            </div>
        </div>
    )
}

export default Todos;