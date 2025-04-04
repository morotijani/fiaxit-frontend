import React from 'react'

// function base component
const Button = (props) => {
    console.log(props)
    return (
        <button class="btn btn--primary-alt btn--xs">{props.children}</button>
    )
}

// creating it as a class component
export class Btn extends React.Component {
    render () { // render method
        return (
            <button>{this.props.children}</button>
        )
    }
}

export default Button;