var button = require('./lib/button')

module.exports = function (onclick) {
  var backButton = button({
    title: 'VER MAPA COMPLETO',
    onclick: onclick
  })
  backButton.style.filter = 'alpha(opacity=0.8)'
  backButton.style.display = 'none'
  backButton.style.position = 'absolute'
  backButton.style.right = 0
  backButton.style.margin = '20px'
  return backButton
}