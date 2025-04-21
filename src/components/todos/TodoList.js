import React, { useContext } from 'react'
import  { TodoContext } from '../../contexts/TodoContext'
import { stringToBoolean } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';
import { jsonPatch, jsonDelete } from '../../helpers/Ajax'

function TodoList() {

    const [todoStore, todoDispatch] = useContext(TodoContext);
    
    
    return (
        <div>
            TodoList
        </div>
    )
}

export default TodoList