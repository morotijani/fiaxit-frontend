import React from 'react'
import {Switch, Route} from 'react-router-dom'
import Login from './Login'

function AuthIndex() {
    return (
        <main className="auth-layout">
            <div className="poster">
                <Switch>
                    <Route exact path="/auth/login" component={Login} />
                </Switch>
            </div>
        </main>
    )
}

export default AuthIndex