import React, { PropTypes, createClass } from 'react';
import { render } from 'react-dom';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reducers from './reducers';
import Component from './components/default';

/**
 * @method create
 * @param {HTMLElement} mountNode
 * @return {Object}
 */
export default mountNode => {

    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducers);

    /**
     * @method add
     * @param {String} tagName
     * @return {void}
     */
    const add = tagName => {
        console.log('add shape!');
        // store.dispatch();
    };

    render(
        <Provider store={store}>
            <Component />
        </Provider>,
        mountNode
    );

    return { add };

};
