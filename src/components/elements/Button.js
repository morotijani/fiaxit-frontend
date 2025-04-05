import React from 'react'

// function base component
const Button = (props) => {
    console.log(props)
    let klass = `btn btn--${props.variant} ${props.hasOwnProperty('className')? props.className : ""}`;
    
    if (props.hasOwnProperty('className')) {
        klass += " " +props.className;
    }

    if (props.hasOwnProperty('size')) {
        klass += ` btn--${props.size}`
    }

    return (
        <button className={klass} > {props.children}</button>
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