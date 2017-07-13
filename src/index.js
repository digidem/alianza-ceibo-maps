const d3 = require('d3-request')
const mapboxgl = require('mapbox-gl')
const yo = require('yo-yo')
const extent = require('@mapbox/geojson-extent')

var areas = require('../areas/areas.json')
var layerStyles = require('./layer_styles')
var generateAreaLayers = require('./area_layers')
var comunidadPopup = require('./comunidad_popup')

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

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/gmaclennan/cj1vbt7t3000c2roecku5yaae', // stylesheet location
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
  var comunidades = addIds(unfurl(filterGeom(data['Comunidades']), dataIndex))

  map.addSource('comunidades', {
    type: 'geojson',
    data: comunidades
  })

  map.addSource('areas', {
    type: 'geojson',
    data: areas
  })

  Object.keys(areaLayers).forEach(function (id) {
    map.addLayer(areaLayers[id])
  })

  map.addLayer(layerStyles.areaHighlight)
  map.addLayer(layerStyles.comunidadesDots)
  map.addLayer(layerStyles.comunidadesHouses)
  map.addLayer(layerStyles.comunidadesDotsHighlight)
  map.addLayer(layerStyles.comunidadesHousesHighlight)

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

function unfurl (featureCollection, index) {
  var featuresWithRefs = featureCollection.features.map(function (f) {
    var props = f.properties
    var newProps = Object.assign({}, props)
    for (var key in props) {
      if (!Array.isArray(props[key])) continue
      newProps[key] = props[key].map(function (d) {
        if (index[d]) {
          return index[d].properties[key]
        } else return d
      })
      if (newProps[key].length === 1) newProps[key] = newProps[key][0]
    }
    return Object.assign({}, f, {
      properties: newProps
    })
  })
  return fc(featuresWithRefs)
}

function addIds (featureCollection) {
  var featuresWithIds = featureCollection.features.map(function (f) {
    return Object.assign({}, f, {
      properties: Object.assign({}, f.properties, {_id: f.id})
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
  console.log(areas)
  return areas.features.filter(function (f) {
    return f.properties._id === id
  })[0]
}
