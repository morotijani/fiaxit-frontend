import React, { useContext } from 'react'
import  { TodoContext } from '../../contexts/TodoContext'
import { stringToBoolean } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';
import { jsonPatch, jsonDelete } from '../../helpers/Ajax'

function TodoList() {

    const [todoStore, todoDispatch] = useContext(TodoContext);

    async function handleUpdateCompleted(evt) {
        const resp = await jsonPatch(`todos/${evt.target.value}`, {completed: evt.target.checked})
        if (resp.success) {
            if (stringToBoolean(resp.todo.completed)) {
                toast.success('Todo completed', {duration: 6000});
            } else {
                toast.failed('Todo marked as Incomplete', {duration: 6000});
            }
            todoDispatch({type: 'TodoUpdated', payload: resp.todo})
        }
        return resp;
    }

    async function handleDeleteTodo(evt) {
        console.log(evt);
    }
    
    const todoList = todoStore.todos.map((todo, index) => {
        return (
            <li key={index}>
                <input type="checkbox" value={todo.id} checked={stringToBoolean(todo.completed)} onChange={handleUpdateCompleted} />
                {todo.name}
                <span className="trash-button" onClick={handleDeleteTodo} data-id={todo.id} role="button" aria-label="Trash Can">🥫</span>
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