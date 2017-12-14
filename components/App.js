const React = require('react')
const {BrowserRouter, Route} = require('react-router-dom')

const Main = require('./Main')

const App = () => (
  <BrowserRouter>
    <Route path='/:nation?/:area?/:community?' render={({match, history, location}) => (
      <Main
        nation={dec(match.params.nation)}
        area={dec(match.params.area)}
        community={dec(match.params.community)}
        history={history}
        location={location} />
    )} />
  </BrowserRouter>
)

module.exports = App

// Some names include a `/` which we encode, and needs to be decoded
function dec (str) {
  return str && window.decodeURIComponent(str)
}
