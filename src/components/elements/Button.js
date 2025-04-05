import React from 'react'

// function base component
const Button = (props) => {
    console.log(props)
    const Klass = `btn btn--${props.variant} ${props.hasOwnProperty('className')? props.className : ""}`;
    return (
        <button className={Klass} > {props.children}</button>
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