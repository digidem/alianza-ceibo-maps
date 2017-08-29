const yo = require('yo-yo')
const css = require('sheetify')

const translations = {
  'header': {
    es: 'Instalaciones de agua y solar',
    en: 'Water and Solar Installations'
  },
  'agua': {
    es: 'Instalaciones de agua',
    en: 'Water Installations '
  },
  'solar': {
    es: 'Instalaciones de solar',
    en: 'Solar Installations '
  },
  'agua-solar': {
    es: 'Instalaciones de agua y solar',
    en: 'Water and Solar Installations '
  },
  'agua-solar-story': {
    es: 'Instalaciones de agua y solar con historias',
    en: 'Water and Solar Installations with stories'
  },
  'legal-process': {
    es: 'En proceso de reclamacíon legal',
    en: 'In process of legal claim'
  },
  'explore': {
    es: 'EXPLORAR',
    en: 'EXPLORE'
  },
  'territory': {
    es: 'territorio',
    en: 'territory'
  }
}

module.exports = Legend

function Legend (data, opts) {
  if (!(this instanceof Legend)) return new Legend(data, opts)
  if (!opts) opts = {}
  this.data = data
  this.lang = opts.lang || 'es'
  this.el = this._getElement()
  document.body.append(this.el)
}

Legend.prototype.updateLang = function (lang) {
  this.lang = lang
  yo.update(this.el, this._getElement())
}

Legend.prototype._getElement = function () {
  var lang = this.lang
  var data = this.data
  var legendStyles = css`
    :host {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      height: 100%;
      z-index: 1;
      overflow: auto;

      .legend {
        position: relative;
        padding: 30px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        line-height: 18px;
        margin: 40px;
        border-radius: 10px;
        width: 50%;
        min-width: 700px;
        text-align: center;
        background: rgb(255, 255, 255);
        .legend-inner {
          display: flex;
          justify-content: center;
        }
        ul {
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
          list-style: none;
          li {
            display: flex;
            align-items: center;
            margin: 5px;
          }
        }
        img {
          width: 20px;
        }

        button {
          width: 100px;
          height: 50px;
          border: 2px solid black;
          font-size: 16px;
          font-family: 'EB Garamond';
          font-weight: bold;
          background: white;
          &:hover {
            background-color: #ddd;
            cursor: pointer;
          }
        }
      }

      .legend-text {
        margin-left: 5px;
      }

      .legend-territory {
        width: 30px;
        height: 20px;
        border: 1px solid;
      }

      .cross-hatched {
        background-image: url("icons/cross-hatch.svg");
        border: 1px solid black;
      }
      h1 {
        text-transform: uppercase;
      }
    }
  `

  var el = yo`<div style="display: none;">
    <div class="map-overlay ${legendStyles}">
      <div class="legend">
      <h1>${translations['header'][lang]}</h1>
      <div class="legend-inner">
        <ul>
          <li>
            <img src="icons/comunidad-agua-dot.svg" />
            <img src="icons/comunidad-agua.svg" />
            <span class="legend-text">${translations['agua'][lang]}</span>
          </li>
          <li>
            <img src="icons/comunidad-solar-dot.svg" />
            <img src="icons/comunidad-solar.svg" />
            <span class="legend-text">${translations['solar'][lang]}</span>
          </li>
          <li>
            <img src="icons/comunidad-agua-solar-dot.svg" />
            <img src="icons/comunidad-agua-solar.svg" />
            <span class="legend-text">${translations['agua-solar'][lang]}</span>
          </li>
          <li>
            <img src="icons/comunidad-agua-story.svg" />
            <img src="icons/comunidad-agua-solar-story.svg" />
            <span class="legend-text">${translations['agua-solar-story'][lang]}</span>
          </li>
        </ul>
        <ul>
          ${data.Nacionalidades.features.map(function (feature) {
            var props = feature.properties
            var color = props.Color.replace('rgb', 'rgba').replace(')', ',.4)')
            if (props.Nacionalidad === 'Kichwa') return
            return yo`
              <li>
                <div class="legend-territory"
                     style="background-color:${color}; border-color: ${props.Color}"></div>
                <span class="legend-text"> ${props.Nacionalidad} ${translations['territory'][lang]}</span>
              </li>
            `
          })}
          <li>
            <div class="legend-territory cross-hatched"></div>
            <span class="legend-text">${translations['legal-process'][lang]}</span>
          </li>
        </ul>
      </div>
      <button onclick=${close}>${translations['explore'][lang]}</button>
      </div>
    </div>
  </div>
  `
  function close () {
    el.style.display = 'none'
  }
  return el
}
