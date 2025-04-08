import React from 'react';
import { BrowserRouter as Router, Routes as Switch, Route, Link } from 'react-router-dom';
import AppIndex from './AppIndex';
import AuthIndex from './components/auth/AuthIndex'
import ContextProvider from './context/contextProvider';

function App() {
  	return (
		<ContextProvider>
			<Router>
				<Switch>
					<Route path="/auth" element={<AuthIndex />} />
					<Route path="/" element={<AppIndex />} />
				</Switch>
			</Router>
		</ContextProvider>
  	);
}

export default App;
