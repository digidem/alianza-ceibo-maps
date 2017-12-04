const React = require('react')
const {BrowserRouter, Route} = require('react-router-dom')

const Main = require('./Main')

const App = () => (
  <BrowserRouter>
    <Route path='/:nation?/:area?/:community?' render={({match}) => (
      <Main nation={match.params.nation} area={match.params.area} community={match.params.community} />
    )} />
  </BrowserRouter>
)

module.exports = App
