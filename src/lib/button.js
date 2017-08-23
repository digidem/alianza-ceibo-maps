const css = require('sheetify')
const yo = require('yo-yo')

module.exports = function (props) {
  var styles = css`
    :host {
      z-index: 1;
      padding: 15px;
      border: 1px solid black;
      background: transparent;
      font-weight: bold;
      font-size: 14px;
    }
    :host:hover {
      cursor: pointer;
      background-color: rgba(255,255,255,0.8);
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
