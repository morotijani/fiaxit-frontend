import { useState, useContext } from 'react';
import { Form } from '../../helpers/Form'
import FieldBlock from '../elements/FieldBlock'
import Button from '../elements/Button'
import toast from 'react-hot-toast';

function TodoForm() {

    const [fields, setFields] = useState({
        name: {value: "", isInvalid: false, msg: ""}, 
        completed: {value: 0, isInvalid: false, msg: ""}
    })
    
    // callback from our form submit from our backend
    function success(resp) {
        toast.success("Todo added successfully !");
        console.log(resp);
    }

    // setup form
    const form = new Form('todos/', fields, setFields, success);

    return (
        <div className="poster flex-grow-1">
            <h3>Add new Todo </h3>
            <FieldBlock id="name" label="Todo" isInvalid={fields.name.isInvalid} value={fields.name.value} onChange={form.handleInputChanges} feedback={fields.name.msg} />

            <div className="l_footer_bottons">
                <Button variant="primary" onClick={form.submitForm}>Create todo</Button>
            </div>
        </div>
    )
}

export default TodoForm