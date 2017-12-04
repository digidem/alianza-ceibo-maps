const React = require('react')
const ReactDOM = require('react-dom')

const App = require('./components/App')

const root = document.createElement('div')

document.body.appendChild(root)

ReactDOM.render(<App />, root)
