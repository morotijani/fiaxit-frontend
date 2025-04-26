import {AuthStore} from './AuthContext';
import { TodoStore } from './TodoContext'
import { ContactStore } from './ContactContext'
import { Toaster } from 'react-hot-toast';


function ContextProvider(props) {
    return(
        <ContactStore>
            <AuthStore>
                <TodoStore>
                    {props.children}
                    <Toaster position="bottom-center" />
                </TodoStore>
            </AuthStore>
        </ContactStore>
        
    );
} 

export default ContextProvider;