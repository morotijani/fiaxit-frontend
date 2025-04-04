import React from 'react'
import MainNav from './components/MainNav'
import Button, {Btn} from './components/elements/Button'

function AppIndex() {
    return(
        <main>
            <MainNav />
            <div className="main-content">
                <Button />
                <Btn />
            </div>
        </main>
    )
}

export default AppIndex