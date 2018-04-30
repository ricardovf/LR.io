import React from 'react';
// import logo from './logo.svg';
import { hot } from 'react-hot-loader';
// import ErrorBoundary from './ErrorBoundary';
import LayoutWithResponsiveDrawer from './components/LayoutWithResponsiveDrawer';
import { BrowserRouter as Router } from 'react-router-dom';

class App extends React.Component {
  render() {
    return (
      <Router>
        <LayoutWithResponsiveDrawer />
      </Router>
    );
  }
}

export default hot(module)(App);
