import React from 'react';
import ReactDOM from 'react-dom';
import Game from './components/game';
import Amplify from 'aws-amplify';
import config from './aws-exports';
Amplify.configure(config); 
 
ReactDOM.render(<Game/>, document.getElementById('root'));

//ReactDOM.render(myfirstelement, document.getElementById('root'));