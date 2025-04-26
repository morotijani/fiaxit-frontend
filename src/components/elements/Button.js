import React, {Component} from 'react'
import {PropTypes} from 'prop-types'

// function base component
const Button = (props) => {
    let klass = `btn btn--${props.variant} ${props.hasOwnProperty('className')? props.className : ""}`;
    
    if (props.hasOwnProperty('className')) {
        klass += " " +props.className;
    }

    if (props.hasOwnProperty('size')) {
        klass += ` btn--${props.size}`
    }

    return (
        <button className={klass} onClick={props.onClick} style={props.style}>{props.children}</button>
    )
}

// Define default values
Button.defaultProps = {
    variant: "primary",
    onClick: () => {}
};

Button.propTypes = {
    onClick: PropTypes.func.isRequired, 
    variant: PropTypes.string.isRequired
};

// creating it as a class component
export class Btn extends Component {
    render () { // render method
        return (
            <button>{this.props.children}</button>
        )
    }
}

export default Button;