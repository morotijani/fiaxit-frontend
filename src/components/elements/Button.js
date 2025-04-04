import React from 'react'

// function base component
const Button = () => {
    return (
        <button>Text</button>
    )
}

// creating it as a class component
export class Btn extends React.Component {
    render () { // render method
        return (
            <button>Text</button>
        )
    }
}

export default Button;