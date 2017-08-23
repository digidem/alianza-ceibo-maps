const yo = require('yo-yo')
const css = require('sheetify')

module.exports = function (data) {
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
        background-image: url("/icons/cross-hatch.svg");
        border: 1px solid black;
      }
    }
  `

  var el = yo`
    <div class="map-overlay ${legendStyles}">
      <div class="legend">
      <h1>LAS INSTALACIONES DE AGUA Y SOLAR</h1>
      <div class="legend-inner">
        <ul>
          <li>
            <img src="/icons/comunidad-agua-dot.svg" />
            <img src="/icons/comunidad-agua.svg" />
            <span class="legend-text">Instalaciones de agua</span>
          </li>
          <li>
            <img src="/icons/comunidad-solar-dot.svg" />
            <img src="/icons/comunidad-solar.svg" />
            <span class="legend-text"> Instalaciones de solar</span>
          </li>
          <li>
            <img src="/icons/comunidad-agua-solar-dot.svg" />
            <img src="/icons/comunidad-agua-solar.svg" />
            <span class="legend-text">Instalaciones de agua y solar</span>
          </li>
          <li>
            <img src="/icons/comunidad-agua-story.svg" />
            <img src="/icons/comunidad-agua-solar-story.svg" />
            <span class="legend-text">Instalaciones con historias</span>
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
                <span class="legend-text"> ${props.Nacionalidad} territorio</span>
              </li>
            `
          })}
          <li>
            <div class="legend-territory cross-hatched"></div>
            <span class="legend-text">En proceso de reclamacíon legal</span>
          </li>
        </ul>
      </div>
      <button onclick=${close}>EXPLORAR</button>
      </div>
    </div>
  `
  function close () {
    el.style.display = 'none'
  }
  return el
}
