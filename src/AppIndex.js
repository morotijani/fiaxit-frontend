import React from 'react'
import MainNav from './components/MainNav'
import Button from './components/elements/Button'

function AppIndex() {
    return(
        <main>
            <MainNav />
            <div className="main-content">
                <Button />
            </div>
        </main>
    )
}

export default AppIndex