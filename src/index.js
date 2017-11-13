const xhr = require('xhr')
const qs = require('querystring')
const mapboxgl = require('mapbox-gl')
const extent = require('@mapbox/geojson-extent')
const compose = require('lodash/flowRight')
const assign = require('object-assign')
const which = require('which-polygon')
const elements = require('alianza-elements')
const css = require('sheetify')

var getAreaZoom = require('./lib/area_zoom')
var sidebar = require('./sidebar')
var areasGeom = require('../areas/areas.json')
var layerStyles = require('./layer_styles')
var generateAreaLayers = require('./area_layers')
var areaPopupDOM = require('./area_popup')
var emptyStyle = require('./empty_style.json')
var style = require('./style.json')

css('mapbox-gl/dist/mapbox-gl.css')
css('alianza-elements/style.css')

mapboxgl.accessToken = require('../config.json').mapbox_token

var startingBounds = [-80.55, -2.1, -73.3, 1.06] // W, S, E, N

var lang = qs.parse(window.location.search.replace('?', '')).lang || 'en'
var body = document.querySelector('body')
if (lang === 'en') body.style = "font-family: 'Montserrat' !important;"
else if (lang === 'es') body.style = "font-family: 'Helvetica' !important;"

var data
var areasByName = {} // this is needed to match data.json to area.json
var nacionalidadesByName = {}

var comunidadesInteractiveLayers = [
  'alianza-comunidades-dots',
  'alianza-comunidades-houses',
  'alianza-comunidades-dots-highlight',
  'alianza-comunidades-houses-highlight'
]

var pending = 2

var loc = window.location
style.sprite = loc.origin + loc.pathname + 'style/sprite'

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: emptyStyle, // stylesheet location
  center: [-78.415, -1.639], // starting position
  zoom: 5.5, // starting zoom
  hash: true,
  dragRotate: false,
  keyboard: false,
  maxBounds: [-87, -9, -70, 6]
}).on('load', onLoad)

xhr.get('data.json', { headers: {
  'Content-Type': 'application/json'
}}, function (err, resp, body) {
  if (err) return console.error(err)
  data = JSON.parse(body)
  data.Index = {}
  Object.keys(data).forEach(function (key) {
    if (key === 'Index') return
    data[key].features.forEach(function (feature) {
      data.Index[feature.id] = feature
      if (key === 'Areas') areasByName[feature.properties['Area nombre']] = feature
      else if (key === 'Nacionalidades') nacionalidadesByName[feature.properties.Nacionalidad] = feature
    })
  })
  onLoad()
})

var areas = addIds(areasGeom)
var areaPointIndex = which(areas)
var areaLayers = generateAreaLayers(map, areas)

function onLoad () {
  if (--pending > 0) return
  var comunidades = compose(addIconFieldAndFilter, addIds, addNationalities(data.Index), filterGeom)(data.Comunidades)
  areas.features.forEach(function (a) {
    var nac = nacionalidadesByName[a.properties.nacionalidad]
    if (!nac.geometry) nac.geometry = { type: 'Polygon', coordinates: [] }
    nac.geometry.coordinates.push(a.geometry.coordinates)
  })

  style.sources.comunidades = {
    type: 'geojson',
    data: comunidades
  }

  style.sources.areas = {
    type: 'geojson',
    data: areas
  }

  Object.keys(areaLayers).forEach(function (id) {
    style.layers.push(areaLayers[id])
  })

  style.layers.push(layerStyles.areaHighlight)
  style.layers.push(layerStyles.comunidadesDots)
  style.layers.push(layerStyles.comunidadesHouses)
  style.layers.push(layerStyles.comunidadesDotsHighlight)
  style.layers.push(layerStyles.comunidadesHousesHighlight)

  map.setStyle(style, {diff: false})

  map.fitBounds(startingBounds, {padding: 20})

  var areaPopup = elements.popup(map, {closeButton: false})

  var sb = sidebar(lang, data)
  sb.on('mapOverview', function () {
    map.fitBounds(startingBounds, {padding: 20})
  })

  sb.on('viewNationalidad', function (nacionalidad) {
    var nac = nacionalidadesByName[nacionalidad.properties.Nacionalidad]
    if (nac.geometry) zoomToArea(nac)
  })

  var areaFillIds = areas.features.map(function (f) { return f.properties._id })

  map.on('mousemove', function (e) {
    var _areas = map.queryRenderedFeatures(e.point, { layers: areaFillIds })
    var _comunidades = map.queryRenderedFeatures(e.point, { layers: comunidadesInteractiveLayers })
    var areaHovered = _areas && _areas[0]
    var communityHovered = _comunidades && _comunidades[0]
    if (areaHovered && map.getZoom() > getAreaZoom(map, _areas[0]) - 1) areaHovered = false

    if (areaHovered || communityHovered) {
      map.getCanvas().style.cursor = 'pointer'
    } else {
      map.getCanvas().style.cursor = ''
      map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
      map.setFilter('alianza-comunidades-houses-highlight', ['==', '_id', ''])
      map.setFilter('alianza-comunidades-dots-highlight', ['==', '_id', ''])
    }

    if (communityHovered) {
      var cid = _comunidades[0].properties._id
      map.getSource('')
      map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
      map.setFilter('alianza-comunidades-houses-highlight', ['==', '_id', cid])
      map.setFilter('alianza-comunidades-dots-highlight', ['==', '_id', cid])
    }

    if (areaHovered) {
      var id = _areas[0].properties._id
      var area = getArea(id, areas)
      map.setFilter('alianza-areas-highlight', ['==', '_id', id])
      // for some reason we are seeing many duplicate comunidades when querying features
      var areaComunidades = comunidades.features.filter(function (f) {
        var area = areaPointIndex(f.geometry.coordinates)
        return area && area.name === areaHovered.properties.name
      })

      // some of them don't have a feature row in airtable, so we use what we have
      var feature = areasByName[areaHovered.properties.name]
      var props = feature ? feature.properties : getAreaFeatureProps(areaHovered)
      sb.highlightArea(area)

      // todo: replace popups with changing the sidebar data and calling .update()
      areaPopup.update(areaPopupDOM(props, areaComunidades))
      areaPopup.setLngLat(e.lngLat)
      areaPopup.popupNode.addEventListener('click', function (e) {
        zoomToArea(area)
      })
    } else {
      sb.removeHighlights()
    }
  })

  /**
   * Converts the given area feature from area.json into the format
   * needed by area_popup.js, which is represented in the data.json file.
   * @param  {Object} area GeoJSON feature for Area.json
   * @return {Object}      GeoJSOn feature for data.json
   */
   // TODO: create an areas handler for everything to do with retrieving area data
   // so we don't have to manage that in this file
  function getAreaFeatureProps (area) {
    return {
      'Area nombre': area.properties.name,
      Color: [area.layer.paint['fill-color']]
    }
  }

  function zoomToArea (area) {
    map.fitBounds(extent(area), {padding: 20})
    map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
  }

  map.on('click', onMapClick)
  function onMapClick (e) {
    var queryAreas = map.queryRenderedFeatures(e.point, { layers: areaFillIds })
    var queryCommunidades = map.queryRenderedFeatures(e.point, { layers: comunidadesInteractiveLayers })
    var areaClicked = queryAreas && queryAreas[0]
    var communityClicked = queryCommunidades && queryCommunidades[0]

    if (communityClicked) {
      var feature = data.Index[communityClicked.properties._id]
      sb.viewCommunity(feature)
    } else if (areaClicked) {
      var area = getArea(areaClicked.properties._id, areas)
      var nac = nacionalidadesByName[area.properties.nacionalidad]
      sb.viewNationality(nac)
      zoomToArea(area)
    } else {
      sb.viewNationalities()
      sb.update()
    }
  }
}

// Only return features with geometry
function filterGeom (featureCollection) {
  var featuresWithGeom = featureCollection.features.filter(function (f) { return f.geometry })
  return fc(featuresWithGeom)
}

function addNationalities (index) {
  return function (featureCollection) {
    var featuresWithNationalities = featureCollection.features.map(function (f) {
      var nationalityId = f.properties.Nacionalidad && f.properties.Nacionalidad[0]
      if (!nationalityId) return f
      return assign({}, f, {
        properties: assign({}, f.properties, {
          Nacionalidad: index[nationalityId].properties.Nacionalidad
        })
      })
    })
    return fc(featuresWithNationalities)
  }
}

var AGUA = 'Sistemas de agua'
var SOLAR = 'Sistemas solares'

function addIconFieldAndFilter (featureCollection) {
  var featuresWithIconField = featureCollection.features.map(function (f) {
    var icon
    var programas = f.properties.Programas || []
    if (includes(programas, AGUA) && includes(programas, SOLAR)) {
      icon = 'comunidad-agua-solar'
    } else if (includes(programas, AGUA)) {
      icon = 'comunidad-agua'
    } else if (includes(programas, SOLAR)) {
      icon = 'comunidad-solar'
    } else {
      icon = 'comunidad'
    }
    return assign({}, f, {
      properties: assign({}, f.properties, {
        icon: icon
      })
    })
  }).filter(function (f) {
    // Remove communities with no agua or solar program
    return f.properties.icon !== 'comunidad'
  })
  return fc(featuresWithIconField)
}

function includes (arr, value) {
  return arr.indexOf(value) > -1
}

function addIds (featureCollection) {
  var featuresWithIds = featureCollection.features.map(function (f, i) {
    return assign({}, f, {
      id: f.id || i + Date.now() + '',
      properties: assign({}, f.properties, {_id: f.id || i + Date.now() + ''})
    })
  })
  return fc(featuresWithIds)
}

function fc (features) {
  return {
    type: 'FeatureCollection',
    features: features
  }
}

function getArea (id, areas) {
  return areas.features.filter(function (f) {
    return f.properties._id === id
  })[0]
}
