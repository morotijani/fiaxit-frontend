import {AuthStore} from './AuthContext';
import { TodoStore } from './TodoContext'
import { ContactStore } from './ContactContext'
import { ThemeProvider } from './ThemeContext';
import { Toaster } from 'react-hot-toast';


function ContextProvider(props) {
    return(
        <ThemeProvider>
            <ContactStore>
                <AuthStore>
                    <TodoStore>
                        {props.children}
                        <Toaster position="bottom-center" />
                    </TodoStore>
                </AuthStore>
            </ContactStore>
        </ThemeProvider>
    );
} 

export default ContextProvider;