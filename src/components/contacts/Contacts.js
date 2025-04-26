import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ContactContext } from '../../contexts/ContactContext'
import { jsonDelete } from '../../helpers/Ajax'
import Button from '../elements/Button'
import toast from 'react-hot-toast';

function Contacts() {

    const [contactStore, contactDispatch] = useContext(ContactContext);

    async function handleContactDelete(id) {
        if (window.confirm("Are you siure you want to delete this contact?  This cannot be undone !")) {
            const resp = await jsonDelete(`contacts/${id}`)
            if (resp.success) {
                contactDispatch({type: 'contactDeleted', payload: id});
                toast.success("Contacted deleted !", {duration :6000})
            } else {
                toast.failed("Something went wrong please try again !", {duration :6000})
            }
        }
    }

    const contactList = contactStore.contacts.map((contact, index) => {
        return ( 
            <tr key={index}>
                <td>{contact.fname}</td>
                <td>{contact.lname}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{contact.message}</td>
                <td>
                    <Link className="btn btn--xs btn--primary" to={`/contacts/${contact.id}`}>Edit</Link>
                    <Button variant="danger" size="xs" onClick={() => handleContactDelete(contact.id)} style={{marginLeft:8}}>Delete</Button>

                </td>
            </tr>
        )
    })

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between">
                <h1>My contacts</h1>
                <Link to='/contacts/new/' className="btn btn--primary-alt">Create contacts</Link>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Message</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {contactList}
                </tbody>
            </table>
        </div>
    )
}

export default Contacts;