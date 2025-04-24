import { useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function Contacts() {
    return (
        <div>
            <div className="d-flex align-items-center justify-content-between">
                <h1>My contacts</h1>
                <Link to='/contacts/new/' className="btn btn--primary-alt">Create contacts</Link>
            </div>
        </div>
    )
}

export default Contacts;