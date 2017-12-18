import React from 'react'
import qs from 'querystring'
import { BrowserRouter, Route } from 'react-router-dom'
import { IntlProvider, addLocaleData } from 'react-intl'
import esLocaleData from 'react-intl/locale-data/es'

import Main from './Main'

const locale = qs.parse(window.location.search.replace(/^\?/, '')).lang || 'en'
addLocaleData(esLocaleData)

const App = () => (
  <IntlProvider locale={locale}>
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
  </IntlProvider>
)

module.exports = App

// Some names include a `/` which we encode, and needs to be decoded
function dec (str) {
  return str && window.decodeURIComponent(str)
}
