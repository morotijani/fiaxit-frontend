import React from 'react'
import MainNav from './components/MainNav'
import Button, {Btn} from './components/elements/Button'

function AppIndex() {
    return(
        <main>
            <MainNav />
            <div className="main-content">
                <Button variant="primary">
                    Button One <span>%</span>
                </Button>
                {/* <Button>Button Two</Button>
                <Btn>Class base component</Btn> */}
            </div>
        </main>
    )
}

export default AppIndex