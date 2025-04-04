import React, {useState} from 'react'
import MainNav from './components/MainNav'
import Button from './components/elements/Button'
import FieldBlock from './components/FieldBlock'

function AppIndex() {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    return(
        <main>
            <MainNav />
            <div className="main-content">
                <h2>Your username will be: {username}</h2>
                <FieldBlock 
                    id="username" value={username} onChange={(evt) => {setUsername(evt.target.value)}}
                    label="Username:"
                />
                <FieldBlock
                    id="password" value={password} onChange={(evt) => setPassword(evt.target.value)} 
                    label="Password:" type="password" feedback="must be 8 characters !" isInvalid={true}
                />



                <Button variant="primary" onClick={() => window.alert("Button clicked")}>
                    Button One <span>%</span>
                </Button>
                <Button variant="secondary">
                    Button One <span>%</span>
                </Button>

                <Button variant="primary-alt">
                    Button One <span>%</span>
                </Button>

                <Button variant="danger" size="xs">
                    Button One <span>%</span>
                </Button>
                <Button>No prop</Button>
                {/* <Button>Button Two</Button>
                <Btn>Class base component</Btn> */}
            </div>
        </main>
    )
}

export default AppIndex