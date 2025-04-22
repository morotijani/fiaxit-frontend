import React, { useContext } from 'react'
import  { TodoContext } from '../../contexts/TodoContext'
import { stringToBoolean } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';
import { jsonPatch, jsonDelete } from '../../helpers/Ajax'

function TodoList() {

    const [todoStore, todoDispatch] = useContext(TodoContext);

    async function handleUpdateCompleted(evt) {
        console.log(evt);
    }

    async function handleDeleteTodo(evt) {
        console.log(evt);
    }
    
    const todoList = todoStore.todos.map((todo, index) => {
        return (
            <li key={index}>
                <input type="checkbox" value={todo.todo_id} checked={stringToBoolean(todo.completed)} onChange={handleUpdateCompleted} />
                {todo.name}
                <span className="trash-button" onClick={handleDeleteTodo} data-id={todo.todo_id} role="button" aria-label="Trash Can">U+1F50🥫</span>
            </li>
        )
    });

    return (
        <div className="poster flex-grow-4">
            <ul className="todo-list">
                { todoList }
            </ul>
        </div>
    )
}

export default TodoList