const yo = require('yo-yo')
const css = require('sheetify')

module.exports = Sidebar

var translations = {
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

function Sidebar (language, data) {
  if (!(this instanceof Sidebar)) return new Sidebar(language, data)
  this.language = language
  this.data = data
  this.el = this._getElement()
  document.body.appendChild(this.el)
}

Sidebar.prototype.update = function () {
  yo.update(this.el, this._getElement())
}

Sidebar.prototype._getElement = function () {
  var data = this.data
  var totalWater = data.totalWater
  var totalSolar = data.totalSolar
  var total = totalWater + totalSolar
  var comunidades = data.comunidades

  var styles = css`
    :host {
      width: 30%;
      .header {
        padding: 25px;
        background-color: #365973;
        color: white;
      }
      .number {
        font-size: 1rem;
      }
      .content {
        padding: 0px 30px;
      }
      img {
        max-width: 100%;
      }
      .list-items {
        margin: 30px 0px;
        box-shadow: 0px 0px 8px 0px #dedede;
      }
      .item {
        display: flex;
        padding: 5px 15px;
        border: 1px solid #dedede;
        justify-content: space-between;
        border-bottom: none;
      }
      .item img {
        height: 30px;
      }
      .item:last-child {
        border-bottom: 1px solid #dedede;
      }
      .community-item {
        display: flex;
        padding: 30px 0px;
        justify-content: space-between;
      }
      .community-item img {
        max-height: 60px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

    }
  `

  return yo`<div class="${styles}">
    <div class="header">
      <h1>Water & Solar Installations</h1>
      <h5>${total} total installations</h5>
    </div>
    <img src="sidebar.png" />
    <div class="content">
      <p>
        Our focus on building solutions is not about quick technological fixes, nor the naïve belief in the power of "good intentions"
        to resolve a deep human health, social and environmental crisis, but rather it is about working side-by-side
        with indigenous peoples struggling to secure life’s basic necessities in a first imperiled by the industrial frontier.
      </p>
      <div class="list-items">
        <div class="item">
          <div class="flex">
          <img src="water.png" />
          <h4>
            Water Installations
          </h4>
          </div>
          <h4 class="number">
            ${totalWater}
          </h4>
        </div>
        <div class="item">
          <div class="flex">
            <img src="solar.png" />
            <h4>
              Solar installations
            </h4>
          </div>
          <h4 class="number">
            ${totalSolar}
          </h4>
        </div>
      </div>
    </div>
    <div class="continued-section">
      <h4 class="section-header">Communities in this Area</h4>
        <div class="content">
        ${comunidades.map(function (com) {
          var props = com.properties
          var fotoUrl = props.Foto && props.Foto[0] && props.Foto[0].thumbnails.large.url
          return yo`
          <div class="community-item">
            <div class="community-item-label">
              <h3>${props.Comunidad}</h3>
              <h5>${props.Installations ? props.Installations.length : 0} Installations </h5>
            </div>
            <img src="${fotoUrl}" />
          </div>`
        })}
      </div>
    </div>
  </div>`
}
