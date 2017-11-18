const yo = require('yo-yo')
const url = require('url')
const inherits = require('inherits')
const events = require('events')
const css = require('sheetify')
const legend = require('./legend')

module.exports = Sidebar

var translations = {
  es: {
    header: 'Dónde Trabajamos',
    water: 'Instalaciones de agua',
    solar: 'Instalaciones de solar',
    total: 'instalaciones en total',
    areaHeader: 'Con Quién Trabajamos',
    installations: 'instalaciones',
    mapOverview: 'Ver Mapa Completo'
  },
  en: {
    header: 'Where We Work',
    water: 'Water Installations',
    solar: 'Solar Installations',
    total: ' total installations',
    areaHeader: 'Who We Work With',
    installations: ' installations',
    mapOverview: 'Map Overview'
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
  this.translated = translations[language]
  this.data = data
  const self = this
  // todo: get totals programmatically, once.
  var nacionalidades = self.data.Nacionalidades.features
  const totalWater = nacionalidades
    .map(function (nacionalidad, i) {
      var props = nacionalidad.properties
      if (!props.Nacionalidad || props.Nacionalidad === 'Kichwa') return 0
      return props.Comunidades.reduce(function (sum, cid) {
        var com = self.data.Index[cid]
        return sum + (com.properties.Agua || 0)
      }, 0)
    })
    .reduce((sum, installs) => sum + installs, 0)
  const totalSolar = nacionalidades
    .map(function (nacionalidad, i) {
      var props = nacionalidad.properties
      if (!props.Nacionalidad || props.Nacionalidad === 'Kichwa') return 0
      return props.Comunidades.reduce(function (sum, cid) {
        var com = self.data.Index[cid]
        return sum + (com.properties.Solar || 0)
      }, 0)
    })
    .reduce((sum, installs) => sum + installs, 0)
  this.initial = {
    totalWater: 970,
    totalSolar: totalSolar,
    description: `Our focus on building solutions is not about quick technological fixes, nor the naïve belief in the power of "good intentions"
      to resolve a deep human health, social and environmental crisis, but rather it is about working side-by-side
      with indigenous peoples struggling to secure life’s basic necessities in a first imperiled by the industrial frontier.`,
    foto: 'sidebar.png',
    title: this.translated['header']
  }
  this.viewNationalities()
  this.el = this._getElement()
  document.body.appendChild(this.el)
  events.EventEmitter.call(this)
}

inherits(Sidebar, events.EventEmitter)

Sidebar.prototype.viewNationalities = function () {
  this.viewData = Object.assign({}, this.initial)
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
    return com.properties.Agua || 0
  }).reduce((sum, installs) => sum + installs, 0)

  var totalSolar = comunidades.map(function (communityId) {
    var com = self.data.Index[communityId]
    return com.properties.Solar || 0
  }).reduce((sum, installs) => sum + installs, 0)

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
    totalWater: props.Agua || 0,
    totalSolar: props.Solar || 0
  }
  this.update()
}

Sidebar.prototype._getElement = function () {
  var self = this
  var total = self.viewData.totalWater + self.viewData.totalSolar

  var styles = css`
  :host {
    a {
      text-decoration: none;
    }
    .navbar {
      width: calc(100% - 350px);
      z-index: 0;
      position: fixed;
      background-color: transparent;
      .clickable:hover {
        cursor: pointer;
        text-decoration: underline;
      }
      .navbar-inner {
        background-color: rgba(0,0,0,.4);
        margin-left: 350px;
        font-size: 12px;
        line-height: 40px;
        width: 100%;
        text-transform: uppercase;
        font-weight: bold;
        padding-left: 20px;
        color: rgba(255,255,255,.7);
        .breadcrumbs span:last-child {
          color: white;
        }
      }
    }
    .sidebar {
      width: 350px;
      z-index: 1;
      position: absolute;
      .header {
        padding: 25px;
        background-color: #2f604a;
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
      .list-image {
        height: 100px;
        width: 35%;
      }
      .community-item {
        display: flex;
        padding: 15px 30px;
        justify-content: space-between;
      }
      .clickable:hover {
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
        flex: auto;
      }
      .community-history-info h6 {
        font-size: 8px;
      }
    }
  }
  `

  function getContinuedSection () {
    if (self.view === VIEWS.AREA) return self._comunidadesListDOM()
    else if (self.view === VIEWS.COMUNIDAD) return self._comunidadDOM()
    else return self._areasListDOM()
  }

  function mapOverviewClick () {
    self.emit('mapOverview')
    self.viewNationalities()
    self.update()
  }

  function breadCrumbs () {
    return self.view !== VIEWS.NACIONALIDADES
      ? yo`<span class="breadcrumbs">/ <span>${self.viewData.title}</span></span>`
      : ``
  }

  return yo`<div class="${styles}">
    <div class="navbar">
      <div class="navbar-inner flex space-between">
        <div><span class="clickable" onclick=${mapOverviewClick}>${self.translated['mapOverview']}</span> ${breadCrumbs()}</div>
        ${legend(self.data.Nacionalidades.features, {language: self.language})}
      </div>
    </div>
    <div class="sidebar">
      <div class="header">
        <h1>${self.viewData.title}</h1>
        <h5>${total} ${self.translated['total']}</h5>
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
              ${self.translated['water']}
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
                ${self.translated['solar']}
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
    </div>
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
    <h4 class="section-header">${self.translated['areaHeader']}</h4>
      <div class="community-item-list">
      ${nacionalidades.map(function (nacionalidad, i) {
        var props = nacionalidad.properties
        if (!props.Nacionalidad || props.Nacionalidad === 'Kichwa') return
        var totalInstallations = props.Comunidades.reduce(function (sum, cid) {
          var com = self.data.Index[cid]
          var agua = com.properties.Agua || 0
          var solar = com.properties.Solar || 0
          return sum + agua + solar
        }, 0)

        function areaClicked (event) {
          self.viewNationality(nacionalidad)
          self.emit('viewNationalidad', nacionalidad)
        }

        return yo`
        <div class="community-item clickable" onclick=${areaClicked}>
          <div class="community-item-label">
            <h3>${props['Nacionalidad']}</h3>
            <h6>${totalInstallations} <span>${self.translated['installations']}</span> </h6>
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
        <div class="community-item clickable" data-community="${i}" onclick=${gotoCommunity}>
          <div class="community-item-label">
            <h3>${props.Comunidad}</h3>
            <h6>${totalInstallations} ${self.translated['installations']}</h6>
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

      return yo`<a href="${props.Vinculo}" target="_blank">
        <div class="shadow-item flex clickable">
          <img class="list-image" src="${getFotoUrl(props.Foto)}" />
          <div class="community-history-info">
            <h3>${props.Titulo}</h3>
            <h6>${getShortUrl(props.Vinculo)}</h6>
          </div>
        </div>
      </a>
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
