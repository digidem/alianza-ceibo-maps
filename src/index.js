const d3 = require('d3-request')
const mapboxgl = require('mapbox-gl')
const yo = require('yo-yo')
const extent = require('@mapbox/geojson-extent')
const compose = require('lodash/flowRight')
const assign = require('object-assign')

var areas = require('../areas/areas.json')
var layerStyles = require('./layer_styles')
var generateAreaLayers = require('./area_layers')
var comunidadPopup = require('./comunidad_popup')
var emptyStyle = require('./empty_style.json')
var style = require('./style.json')

mapboxgl.accessToken = require('../config.json').mapbox_token

var data
var dataIndex = {}

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

map.addControl(new mapboxgl.FullscreenControl(), 'top-left')

d3.json('data.json', function (err, _data) {
  if (err) return console.error(err)
  data = _data
  Object.keys(data).forEach(function (key) {
    data[key].features.forEach(function (feature) {
      dataIndex[feature.id] = feature
    })
  })
  onLoad()
})

var areaLayers = generateAreaLayers(map, areas)

function onLoad () {
  if (--pending > 0) return
  var comunidades = compose(addIconField, addIds, addNationalities(dataIndex), filterGeom)(data['Comunidades'])

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

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')

  map.fitBounds(extent(areas), {padding: 20})

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
  })

  var popupNode = yo`<div></div>`
  popup.setDOMContent(popupNode)

  map.on('mousemove', function (e) {
    var areas = map.queryRenderedFeatures(e.point, { layers: Object.keys(areaLayers) })
    var comunidades = map.queryRenderedFeatures(e.point, { layers: comunidadesInteractiveLayers })
    var areaHovered = areas && areas[0] && map.getZoom() < areas[0].layer.maxzoom && areas[0]
    var communityHovered = comunidades && comunidades[0]

    if (areaHovered || communityHovered) {
      map.getCanvas().style.cursor = 'pointer'
    } else {
      map.getCanvas().style.cursor = ''
      map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
      map.setFilter('alianza-comunidades-houses-highlight', ['==', '_id', ''])
      map.setFilter('alianza-comunidades-dots-highlight', ['==', '_id', ''])
      return
    }

    if (communityHovered) {
      var id = comunidades[0].properties._id
      map.getSource('')
      map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
      map.setFilter('alianza-comunidades-houses-highlight', ['==', '_id', id])
      map.setFilter('alianza-comunidades-dots-highlight', ['==', '_id', id])
    } else if (areaHovered) {
      map.setFilter('alianza-areas-highlight', ['==', '_id', areas[0].properties._id])
    }
  })

  map.on('click', function (e) {
    var queryAreas = map.queryRenderedFeatures(e.point, { layers: Object.keys(areaLayers) })
    var queryCommunidades = map.queryRenderedFeatures(e.point, { layers: comunidadesInteractiveLayers })
    var areaClicked = queryAreas && queryAreas[0] && map.getZoom() < queryAreas[0].layer.maxzoom && queryAreas[0]
    var communityClicked = queryCommunidades && queryCommunidades[0]

    if (communityClicked) {
      var feature = dataIndex[communityClicked.properties._id]
      yo.update(popupNode, comunidadPopup(feature.properties, dataIndex))
      popup.setLngLat(feature.geometry.coordinates)
        .addTo(map)
    } else {
      popup.remove()
    }

    if (areaClicked) {
      var area = getArea(areaClicked.properties._id, areas)
      map.fitBounds(extent(area), {padding: 20})
      map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
    }
  })
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

function addIconField (featureCollection) {
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
  })
  return fc(featuresWithIconField)
}

function includes (arr, value) {
  return arr.indexOf(value) > -1
}

function addIds (featureCollection) {
  var featuresWithIds = featureCollection.features.map(function (f) {
    return assign({}, f, {
      properties: assign({}, f.properties, {_id: f.id})
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
