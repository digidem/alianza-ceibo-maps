const qs = require('querystring')

module.exports = getTranslations

function getTranslations (t) {
  const lang = qs.parse(window.location.search.replace('?', '')).lang || 'en'
  return t[lang] || t.en || {}
}
