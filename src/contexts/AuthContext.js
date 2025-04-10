import React, {createContext} from 'react';

export const AuthContext = createContext();

export function AuthStore(props) {
    return(
        // provide information down to our children
        <AuthContext.Provider  value={{userId: 123}}>
            {props.children}
        </AuthContext.Provider>
    )
}