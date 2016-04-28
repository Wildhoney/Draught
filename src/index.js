import React, { createClass } from 'react';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { make } from 'react-standalone';
import Component from './draught/default';
import reducers from './draught/reducers';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducers);

/**
 * @method component
 * @return {XML}
 */
const component = () => {

    return (
        <Provider store={store}>
            <Component />
        </Provider>
    );

};

make('draught-canvas', { component });
