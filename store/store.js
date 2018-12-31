import { createStore, applyMiddleware, compose } from 'redux'
import { neopisReducer } from './neopisReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'remote-redux-devtools';

const store = createStore(neopisReducer, composeWithDevTools(
  applyMiddleware(thunk)
));

export default store;