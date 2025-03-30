import React from 'react';
import { BrowserRouter as Router, Routes as Switch, Route, Link } from 'react-router-dom';
import AppIndex from './AppIndex';
import AuthIndex from './components/auth/AuthIndex'

function App() {
  	return (
    	<Router>
			<Switch>
				<Route path="/auth" element={<AuthIndex />} />
				<Route path="/" element={<AppIndex />} />
			</Switch>
    	</Router>
  	);
}

export default App;
