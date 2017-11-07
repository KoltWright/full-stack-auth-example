import React, { Component } from 'react';
import './Private.css'
import axios from 'axios';
import { connect } from 'react-redux';
import { getUserInfo, updateBalance } from './../../ducks/user';
import { Link } from 'react-router-dom';

class Private extends Component {

    componentDidMount() {
        this.props.getUserInfo();
    }
    //Added two functions
    deposit = (amount, id) => {
      axios.post(`http://localhost:3005/user/balance?Action=deposit&amount=100&currentAmount=${amount}&userId=${id}`)
      .then(balance => {
        let updatedBalance = balance.data[0].balance
        this.props.updateBalance(updatedBalance)
      })
    }

    withdraw = (amount, id) => {
      axios.post(`http://localhost:3005/user/balance?Action=withdraw&amount=100&currentAmount=${amount}&userId=${id}`)
      .then(balance => {
        if(balance.data === 'Balance is too low') {
          alert('Balance is too low!')
        }
        else {
          let updatedBalance = balance.data[0].balance
          this.props.updateBalance(updatedBalance)
        }
      })
    }

    render() {
        const loginJSX = (
            this.props.user ?
                <div className='info-container'>
                    <h1>Community Bank</h1><hr />
                    <h4>Account information:</h4>
                    <img className='avatar' src={this.props.user.img} />
                    <p>Username: {this.props.user.user_name}</p>
                    <p>Email: {this.props.user.email}</p>
                    <p>ID: {this.props.user.auth_id}</p>
                    <h4>Available balance: {this.props.user.balance} </h4>
                    <a href='http://localhost:3005/auth/logout'><button>Log out</button></a>
                    <button onClick={() => {this.deposit(this.props.user.balance, this.props.user.id)}}>Deposit $100</button>
                    <button onClick={() => {this.withdraw(this.props.user.balance, this.props.user.id)}}>Withdraw $100</button>
                </div>
            :
                <div className='info-container'>
                    <h1>Community Bank</h1><hr />
                    <h4>Please log in to view bank information.</h4>
                    <Link to='/'><button>Log in</button></Link>
                </div>
        )

        return (
            <div>
                { loginJSX }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    }
}

export default connect( mapStateToProps, { getUserInfo, updateBalance })(Private);
