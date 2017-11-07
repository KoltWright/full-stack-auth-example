import React, { Component } from 'react';
import logo from './communityBank.svg';
import './Login.css';


export default class Login extends Component {
    render() {
        return (
            <div className='App'>
                <img src={logo} alt=""/>
                <a href="http://localhost:3005/auth"><button>Login</button></a>
            </div>
        )
    }
}
