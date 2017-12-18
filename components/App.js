import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import Main from './Main'


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
