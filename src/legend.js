const yo = require('yo-yo')
const css = require('sheetify')

const translations = {
  'header': {
    es: 'Leyendo del Mapa',
    en: 'Map Legend'
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
  'territory': {
    es: 'territorio',
    en: 'territory'
  }
}

module.exports = function (data, opts) {
  var lang = opts.language || 'es'
  var legendStyles = css`
    :host {
      padding-right: 20px;
      &.open .legend {
        display: block !important;
      }
      .clickable:hover {
        cursor: pointer;
        text-decoration: underline;
      }
      .legend-button {
        padding: 0px 20px;
      }

      .legend {
        line-height: 20px;
        right: 0;
        color: #ccc;
        font-weight: bold;
        background-color: rgba(0,0,0,.7);
        display: none;
        position: fixed;
        font-size: .5rem;
        hr {
          color: black;
          border-style: solid;
        }

        ul {
          padding: 0px 10px;
          list-style: none;
          li {
            display: flex;
            align-items: center;
            margin: 5px;
          }
        }
        img {
          width: 10px;
        }

        button {
          width: 100px;
          height: 50px;
          border: 2px solid black;
          font-size: 16px;
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
        width: 10px;
        height: 10px;
      }

      .cross-hatched {
        background-color: #EEA;
        background-image: url("icons/cross-hatch.svg");
      }
      h1 {
        text-transform: uppercase;
      }
    }
  `

  var el = yo`<div class="${legendStyles}">
  <div class="legend-button clickable" onclick=${toggle}>
    ${translations['header'][lang]}
  </div>
  <div class="legend">
    <div class="legend-inner">
      <ul>
        <li>
          <img src="icons/comunidad-agua-dot.svg" />
          <span class="legend-text">${translations['agua'][lang]}</span>
        </li>
        <li>
          <img src="icons/comunidad-solar-dot.svg" />
          <span class="legend-text">${translations['solar'][lang]}</span>
        </li>
        <li>
          <img src="icons/comunidad-agua-solar-dot.svg" />
          <span class="legend-text">${translations['agua-solar'][lang]}</span>
        </li>
        <li>
          <img src="icons/comunidad-agua-story.svg" />
          <span class="legend-text">${translations['agua-solar-story'][lang]}</span>
        </li>
      </ul>
      <hr>
      <ul>
        ${data.map(function (feature) {
          var props = feature.properties
          if (!props.Nacionalidad) return
          var color = props.Color.replace('rgb', 'rgba').replace(')', ',.4)')
          return yo`
            <li>
              <div class="legend-territory"
                   style="background-color:${color};"></div>
              <div class="legend-text"> ${props.Nacionalidad} ${translations['territory'][lang]}</div>
            </li>
          `
        })}
        <li>
          <div class="legend-territory cross-hatched"></div>
          <span class="legend-text">${translations['legal-process'][lang]}</span>
        </li>
      </ul>
    </div>
  </div>
  `
  function toggle () {
    var cl = el.classList
    cl.contains('open') ? cl.remove('open') : cl.add('open')
  }
  return el
}
