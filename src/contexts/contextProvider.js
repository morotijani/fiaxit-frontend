import {AuthStore} from './AuthContext';
import { TodoStore } from './TodoContext'
import { ContactStore } from './ContactContext'
import { TransactionStore } from './TransactionContext'
import { WalletStore } from './WalletContext'
import { ThemeProvider } from './ThemeContext';
import { Toaster } from 'react-hot-toast';


function ContextProvider(props) {
    return(
        <ThemeProvider>
            <ContactStore>
                <AuthStore>
                    <TodoStore>
                        <TransactionStore>
                            <WalletStore>
                                {props.children}
                                <Toaster position="bottom-center" />
                            </WalletStore>
                        </TransactionStore>
                    </TodoStore>
                </AuthStore>
            </ContactStore>
        </ThemeProvider>
    );
} 

export default ContextProvider;