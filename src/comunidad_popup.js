const yo = require('yo-yo')

module.exports = function comunidadPopup (props, dataIndex) {
  var fotoUrl = props.Foto && props.Foto[0] && props.Foto[0].thumbnails.large.url
  var desc = props.Descripción || 'Description pending'
  var programas = props.Programas || []
  return yo`<div class='popup-wrapper'>
    ${!fotoUrl ? `` : yo`<div class='image16x9'><img src=${fotoUrl}></div>`}
    <div class='popup-inner'>
      <h1>${props.Comunidad}</h1>
      <p>${desc}</p>
      <ul>
        ${programas.map(function (p) {
          return yo`<li>${p}</li>`
        })}
      </ul>
      ${props.Stories && stories(props.Stories, dataIndex)}
    </div>
  </div>`
}

function stories (stories, dataIndex) {
  return yo`<ul>
    ${stories.map(function (id) {
      const storyProps = dataIndex[id].properties
      return yo`<li><a href="${storyProps.Link}">${storyProps.Title}</a></li>`
    })}
  </ul>`
}
