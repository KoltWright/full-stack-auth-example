import axios from 'axios';

// Set up initial state
const initialState = {
    user: {}
};

// action types
const GET_USER_INFO = 'GET_USER_INFO';
//added a const update_balance
const UPDATE_BALANCE = 'UPDATE_BALANCE';

// action creators
export function getUserInfo() {
    const userInfo = axios.get('/auth/me').then( res => {
        return res.data
    })
    return {
        type: GET_USER_INFO,
        payload: userInfo
    }
}
//added a function to update the balance on state
export function updateBalance(balance) {

    return {
        type: UPDATE_BALANCE,
        payload: balance
    }
}

// reducer function
export default function reducer(state = initialState, action) {
    switch (action.type) {
        case GET_USER_INFO + '_FULFILLED':
            return Object.assign({}, state, { user: action.payload });
        case UPDATE_BALANCE:
            return Object.assign({}, state, {user: {
              ...state.user,
              balance: action.payload
            }})
        default:
            return state;
    }

}
