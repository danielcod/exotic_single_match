import React from 'react';
import ReactDOM from 'react-dom';
import {ExoticsAPI} from './components/services';
import App from './components/pages/App';

var ajaxErrHandler=function(xhr, ajaxOptions, thrownError) {
    console.log(xhr.responseText);    
};

var app=React.createElement(App, {
	exoticsApi: new ExoticsAPI(ajaxErrHandler, false)
});
ReactDOM.render(app, document.querySelector('#app'));