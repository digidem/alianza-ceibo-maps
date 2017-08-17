const css = require('sheetify')
const yo = require('yo-yo')

module.exports = function (props) {
  var styles = css`
    :host {
      z-index: 1;
      padding: 15px;
      border: 1px solid black;
      background: white;
      font-weight: bold;
      font-size: 14px;
    }
    :host:hover {
      cursor: pointer;
      background-color: #ddd;
    }
    :host:active, :host:focus {
      outline: 0;
      box-shadow: 0;
    }
  `
  return yo`
    <button class="${styles} ${props.class}" onclick=${props.onclick}>${props.title}</button>
  `
}
