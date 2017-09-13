const css = require('sheetify')
const yo = require('yo-yo')

module.exports = function comunidadPopup (props, dataIndex, opts) {
  if (!opts) opts = {}
  var fotoUrl = props.Foto && props.Foto[0] && props.Foto[0].thumbnails.large.url
  var desc = props.Descripción || 'Description pending'
  var programas = props.Programas || []
  var styles = css`
    :host {
      border: 1px solid black;
      width: 275px
    }

    :host .image16x9 {
      position: relative;
      overflow: hidden;
      padding-bottom: 56.25%;
    }

    :host .image16x9 img {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      width: 100%;
    }

    :host a {
      color: red;
    }

    .popup-inner {
      padding: 0 10px 10px 10px;
    }
    `
  return yo`<div class='${styles}'>
    ${!fotoUrl ? `` : yo`<div class='image16x9'><img src=${fotoUrl}></div>`}
    <div class='popup-inner'>
      <h1>${props.Comunidad}</h1>
      <p>${desc}</p>
      <ul>
        ${programas.map(function (p) {
          return yo`<li>${p}</li>`
        })}
      </ul>
      ${props.Historias ? yo`
        <div>
          <h3>${opts.lang === 'en' ? 'Stories' : 'Historias'}</h3>
          ${stories(props.Historias, dataIndex)}
        </div>
      ` : ``}
    </div>
  </div>`
}

function stories (stories, dataIndex) {
  return yo`<ul>
    ${stories.map(function (id) {
      const storyProps = dataIndex[id].properties
      return yo`<li><a href="${storyProps.Vinculo}">${storyProps.Titulo}</a></li>`
    })}
  </ul>`
}
