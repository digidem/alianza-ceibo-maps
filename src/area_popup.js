const css = require('sheetify')
const yo = require('yo-yo')
const rgb = require('./lib/rgb')

module.exports = function areaPopup (props, comunidades) {
  // var fotoUrl = props.Foto && props.Foto[0] && props.Foto[0].thumbnails.large.url
  // var hist = props.Historia || ''
  var name = props['Area nombre']
  var color = rgb(props.Color[0])

  var style = css`
    :host {
      border-radius: 2px;
      text-transform: uppercase;
      font-weight: bold;
      color: black;
      display: flex;
      box-shadow: 0 0 .5em black;

      .area-popup-name {
        padding: 5px 10px;
        border-right: 1px solid black;
      }

      .area-popup-data {
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        img {
          width: 10px;
        }
        .area-popup-data-item {
          padding: 0px 5px;
        }
      }
    }
  `
  var agua = comunidades.filter(function (f) {
    return f.properties.icon === 'comunidad-agua'
  })
  var solar = comunidades.filter(function (f) {
    return f.properties.icon === 'comunidad-agua-solar'
  })

  return yo`<div class='${style}'>
    <div class="area-popup-name" style='background-color:rgba(${color}, .6);'>
      ${name}
    </div>
    ${!comunidades.length ? ''
      : yo`
        <div class="area-popup-data" style='background-color:rgba(${color}, .4);'>
          ${agua.length ? yo`
            <div class="area-popup-data-item">
              <img src="/icons/comunidad-agua-dot.svg" /> ${agua.length}
            </div>
            ` : ''
          }
          ${solar.length ? yo`
            <div class="area-popup-data-item">
              <img src="/icons/comunidad-agua-solar-dot.svg" /> ${solar.length}
            </div>
            ` : ''
          }
        </div>
      `
    }
  </div>`
}
