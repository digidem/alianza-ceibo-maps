import React from 'react'
import qs from 'querystring'
import { BrowserRouter, Route } from 'react-router-dom'
import { IntlProvider, addLocaleData } from 'react-intl'
import esLocaleData from 'react-intl/locale-data/es'
import assign from 'object-assign'

import Main from './Main'
import esStrings from '../messages/es.json'
import xxStrings from '../messages/xx.json'

const translations = {
  en: {},
  es: formatMessages(esStrings, 'es'),
  xx: formatMessages(xxStrings, 'xx')
}

function formatMessages (strings, locale) {
  return Object.keys(strings).reduce((messages, id) => {
    messages[id] = strings[id].message
    return messages
  }, {})
}

const query = qs.parse(window.location.search.replace(/^\?/, ''))
let locale = query.lang || 'en'
let show = query.show || false
if (show === 'water') show = 'agua'
addLocaleData(esLocaleData)

if (typeof query.translate !== 'undefined') {
  locale = 'xx'
  window._jipt = [['project', 'alianza-ceibo-maps']]
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = '//cdn.crowdin.com/jipt/jipt.js'
  document.head.appendChild(script)
  // This pseudo locale is used for crowdin incontext translation
  // https://support.crowdin.com/in-context-localization/
  const pseudoLocale = assign({}, esLocaleData[0], {locale: 'xx'})
  addLocaleData([pseudoLocale])
}

const App = () => (
  <IntlProvider locale={locale} messages={translations[locale]}>
    <BrowserRouter>
      <Route path='/:nation?/:area?/:community?' render={({match, history, location}) => (
        <Main
          show={show}
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
