const yo = require('yo-yo')
const url = require('url')
const inherits = require('inherits')
const events = require('events')
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

const VIEWS = {
  NACIONALIDADES: 1,
  AREA: 2,
  COMUNIDAD: 3
}

function Sidebar (language, data) {
  if (!(this instanceof Sidebar)) return new Sidebar(language, data)
  this.language = language
  this.data = data
  // todo: get totals programmatically, once.
  this.initial = {
    totalWater: 765,
    totalSolar: 67,
    description: `Our focus on building solutions is not about quick technological fixes, nor the naïve belief in the power of "good intentions"
      to resolve a deep human health, social and environmental crisis, but rather it is about working side-by-side
      with indigenous peoples struggling to secure life’s basic necessities in a first imperiled by the industrial frontier.`,
    foto: 'sidebar.png',
    title: 'Where we Work'
  }
  this.viewData = this.initial
  this.viewNationalities()
  this.el = this._getElement()
  document.body.appendChild(this.el)
  events.EventEmitter.call(this)
}

inherits(Sidebar, events.EventEmitter)

Sidebar.prototype.viewNationalities = function () {
  this.view = VIEWS.NACIONALIDADES
}

Sidebar.prototype.update = function () {
  yo.update(this.el, this._getElement())
  window.scrollTo(0, 0)
}

Sidebar.prototype.viewNationality = function (nacionalidad) {
  var self = this
  var comunidades = nacionalidad.properties.Comunidades
  var totalWater = comunidades.map(function (communityId) {
    var com = self.data.Index[communityId]
    return com.properties.Agua
  }).reduce((sum, installs) => sum + installs, 0)

  var totalSolar = comunidades.filter(function (communityId) {
    var com = self.data.Index[communityId]
    var programas = com.properties.Programas || []
    return includes(programas, 'Sistemas solares')
  }).length

  this.view = VIEWS.AREA
  this.viewData = {
    totalWater: totalWater,
    totalSolar: totalSolar,
    comunidades: comunidades,
    title: nacionalidad.properties.Nacionalidad,
    description: nacionalidad.properties.Resumen,
    foto: getFotoUrl(nacionalidad.properties.Foto)
  }
  this.update()
}

Sidebar.prototype.viewComunidad = function (comunidad) {
  var props = comunidad.properties

  this.view = VIEWS.COMUNIDAD
  this.viewData = {
    title: props.Comunidad,
    foto: getFotoUrl(props.Foto),
    description: props['Description English'],
    historias: props.Historias,
    totalWater: props.Agua,
    totalSolar: includes(props.Programas || [], 'Sistemas solares') ? 1 : 0
  }
  this.update()
}

Sidebar.prototype._getElement = function () {
  var self = this
  var total = self.viewData.totalWater + self.viewData.totalSolar

  var styles = css`
    :host {
      width: 350px;
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
      .shadow-item {
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
        padding: 15px 30px;
        height: 60px;
        justify-content: space-between;
      }
      .community-item:hover {
        background-color: rgba(243, 221, 152, 0.29);
        cursor: pointer;
      }
      .community-item img {
        max-height: 60px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .community-history-info {
        margin: 10px;
      }
    }
  `

  function getContinuedSection () {
    if (self.view === VIEWS.AREA) return self._comunidadesListDOM()
    else if (self.view === VIEWS.COMUNIDAD) return self._comunidadDOM()
    else return self._areasListDOM()
  }

  return yo`<div class="${styles}">
    <div class="header">
      <h1>${self.viewData.title}</h1>
      <h5>${total} total installations</h5>
    </div>
    <img src="${self.viewData.foto}" />
    <div class="content">
      <p>
        ${self.viewData.description}
      </p>
      <div class="shadow-item">
        <div class="item">
          <div class="flex">
          <img src="water.png" />
          <h4>
            Water Installations
          </h4>
          </div>
          <h4 class="number">
            ${self.viewData.totalWater}
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
            ${self.viewData.totalSolar}
          </h4>
        </div>
      </div>
    </div>
    <div class="continued-section">
      ${getContinuedSection()}
    </div>
  </div>`
}

Sidebar.prototype.highlightCommunity = function () {
  // TODO
}

Sidebar.prototype.highlightArea = function () {
  // TODO
}

Sidebar.prototype.removeHighlights = function () {
  // TODO
}

Sidebar.prototype._areasListDOM = function () {
  var self = this
  var nacionalidades = self.data.Nacionalidades.features

  return yo`<div>
    <h4 class="section-header">Who we Work With</h4>
      <div class="community-item-list">
      ${nacionalidades.map(function (nacionalidad, i) {
        var props = nacionalidad.properties
        var totalInstallations = props.Comunidades.reduce(function (sum, cid) {
          var com = self.data.Index[cid]
          var installations = com.properties.Installations
          return sum + (installations ? installations.length : 0)
        }, 0)

        function areaClicked (event) {
          self.viewNationality(nacionalidad)
          self.emit('viewNationalidad', nacionalidad)
        }

        return yo`
        <div class="community-item" onclick=${areaClicked}>
          <div class="community-item-label">
            <h3>${props['Nacionalidad']}</h3>
            <h6>${totalInstallations} Installations </h6>
          </div>
          <img src="${getFotoUrl(props.Foto)}" />
        </div>`
      })}
    </div>
  </div>`
}

Sidebar.prototype._comunidadesListDOM = function () {
  var self = this
  var comunidades = self.viewData.comunidades
  return yo`
  <div>
    <h4 class="section-header">Communities in this Area</h4>
      <div class="community-item-list">
      ${comunidades.map(function (cid, i) {
        var com = self.data.Index[cid]
        var props = com.properties
        function gotoCommunity (event) {
          self.viewComunidad(com)
        }
        var totalInstallations = props.Installations ? props.Installations.length : 0
        if (!totalInstallations || !props.Historias) return

        return yo`
        <div class="community-item" data-community="${i}" onclick=${gotoCommunity}>
          <div class="community-item-label">
            <h3>${props.Comunidad}</h3>
            <h6>${totalInstallations} Installations</h6>
          </div>
          <img src="${getFotoUrl(props.Foto)}" />
        </div>`
      })}
    </div>
  </div>
  `
}

Sidebar.prototype._comunidadDOM = function () {
  var self = this

  return yo`
  <div class="content">
    ${self.viewData.historias.map(function (id) {
      var history = self.data.Index[id]
      var props = history.properties

      function goToLink (event) {
        window.open(props.Vinculo, '_blank')
      }
      return yo`<div class="shadow-item flex" onclick=${goToLink}>
        <img height="100px" src="${getFotoUrl(props.Foto)}" />
        <div class="community-history-info">
          <h3>${props.Titulo}</h3>
          <h6>${getShortUrl(props.Vinculo)}</h6>
        </div>
      </div>
      `
    })}
  </div>
  `
}

function includes (arr, value) {
  return arr.indexOf(value) > -1
}

function getFotoUrl (Foto) {
  return Foto && Foto[0] && Foto[0].thumbnails.large.url
}

function getShortUrl (Vinculo) {
  var u = url.parse(Vinculo)
  return u.host
}
