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
      border-radius: 5px;
      font-weight: bold;
      color: black;
      display: flex;
      background-color: white;
      box-shadow: 0 0 .5em black;
      font-size: 12px;
      font-family: 'Helvetica';

      .square {
        margin: 7px 0px 0px 5px;
        width: 10px;
        height: 10px;
      }

      .area-popup-name {
        padding: 5px;
        border-right: 1px solid black;
      }

      .area-popup-data {
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        img {
          margin-bottom: 2px;
          width: 10px;
        }
        .area-popup-data-item {
          padding: 0px 5px;
        }
      }
    }
  `
  var totalWater = comunidades.map((com) => com.properties.Agua).reduce((sum, installs) => sum + installs, 0)

  var solar = comunidades.filter(function (com) {
    var programs = com.properties.Programas || []
    return programs.indexOf('Sistemas solares') > -1
  })

  return yo`<div class='${style}'>
    <div class="square" style="background-color:rgba(${color}, 0.6);"></div>
    <div class="area-popup-name">
      ${name}
    </div>
    ${!comunidades.length ? ''
      : yo`
        <div class="area-popup-data">
          ${totalWater ? yo`
            <div class="area-popup-data-item">
              <img src="icons/comunidad-agua-dot.svg" /> ${totalWater}
            </div>
            ` : ''
          }
          ${solar.length ? yo`
            <div class="area-popup-data-item">
              <img src="icons/comunidad-agua-solar-dot.svg" /> ${solar.length}
            </div>
            ` : ''
          }
        </div>
      `
    }
  </div>`
}
