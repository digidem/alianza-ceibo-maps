/* global mapboxgl, d3, geojsonExtent */

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var data
var dataIndex = {}
var pending = 2
var inView = []

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
  center: [-78.415, -1.639], // starting position
  zoom: 5.5, // starting zoom
  hash: true,
  dragRotate: false,
  keyboard: false,
  maxBounds: [-87, -9, -70, 6]
}).on('load', done)

var menuDiv = document.createElement('div')

menuDiv.innerHTML = renderMenu([
  'Sistemas de agua',
  'Defensores y defensoras',
  'Mapeo territorial',
  'Monitoreo ambiental',
  'Mujer y familia',
  'Practicas propias',
  'Sistemas solares'
])

menuDiv.className = 'dd_map_menu'

document.getElementById('map').appendChild(menuDiv)

d3.json('data.json', function (err, _data) {
  if (err) return console.error(err)
  data = _data
  Object.keys(data).forEach(function (key) {
    data[key].features.forEach(function (feature) {
      dataIndex[feature.id] = feature
    })
  })
  done()
})

function done () {
  if (--pending > 0) return

  var landTitleAreas = addZooms(map, addIds(unfurl(filterGeom(data['Land Title Area']), dataIndex)))
  var settlements = addIds(unfurl(filterGeom(data['Settlements']), dataIndex))
  map.addSource('land-title-areas', {
    type: 'geojson',
    data: landTitleAreas
  })
  map.addSource('settlements', {
    type: 'geojson',
    data: settlements
  })
  map.addLayer({
    id: 'land-title-areas',
    type: 'fill',
    source: 'land-title-areas',
    layout: {},
    paint: {
      'fill-color': {
        type: 'identity',
        property: 'Color'
      },
      'fill-opacity': 0.6
    }
  })
  map.addLayer({
    id: 'land-title-areas-highlight',
    type: 'fill',
    source: 'land-title-areas',
    layout: {},
    paint: {
      'fill-color': {
        type: 'identity',
        property: 'Color'
      },
      'fill-opacity': 0.7
    },
    filter: ['==', '_id', '']
  })
  map.addLayer({
    id: 'land-title-areas-highlight-lines',
    type: 'line',
    source: 'land-title-areas',
    layout: {},
    paint: {
      'line-color': {
        type: 'identity',
        property: 'Color'
      },
      'line-width': 3
    },
    filter: ['==', '_id', '']
  })
  map.addLayer({
    id: 'settlements',
    type: 'circle',
    source: 'settlements',
    layout: {},
    paint: {},
    filter: ['in', 'Land Title Area']
  })
  map.addLayer({
    id: 'settlements-labels',
    type: 'symbol',
    source: 'settlements',
    layout: {
      'text-field': '{Settlement}',
      'text-anchor': 'bottom-left',
      'text-justify': 'left',
      'text-offset': [0.2, -0.2]
    },
    paint: {},
    filter: ['in', 'Land Title Area']
  })

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')

  map.fitBounds(geojsonExtent(landTitleAreas), {padding: 20})

  map.on('move', function () {
    var toShow = landTitleAreas.features
      .filter(f => map.getZoom() > f.properties._zoom)
      .map(function (f) {
        return f.properties['Land Title Area']
      })
    if (arrayEqual(inView, toShow)) return
    map.setFilter('settlements', ['in', 'Land Title Area'].concat(inView = toShow))
    map.setFilter('settlements-labels', ['in', 'Land Title Area'].concat(inView = toShow))
  })

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
  })

  map.on('mousemove', function (e) {
    var areas = map.queryRenderedFeatures(e.point, { layers: ['land-title-areas'] })
    var settlements = map.queryRenderedFeatures(e.point, { layers: ['settlements'] })

    if (!settlements.length && (!areas.length || inView.indexOf(areas[0].properties['Land Title Area']) > -1)) {
      map.getCanvas().style.cursor = ''
      map.setFilter('land-title-areas-highlight', ['==', '_id', ''])
      map.setFilter('land-title-areas-highlight-lines', ['==', '_id', ''])
      return
    }
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer'
    if (settlements.length) return
    map.setFilter('land-title-areas-highlight', ['==', '_id', areas[0].properties._id])
    map.setFilter('land-title-areas-highlight-lines', ['==', '_id', areas[0].properties._id])
  })

  map.on('click', function (e) {
    var areas = map.queryRenderedFeatures(e.point, { layers: ['land-title-areas'] })
    var settlements = map.queryRenderedFeatures(e.point, { layers: ['settlements'] })
    var feature

    if (settlements.length) {
      feature = dataIndex[settlements[0].properties._id]
      popup.setLngLat(feature.geometry.coordinates)
        .setHTML(renderSettlementPopup(feature.properties))
        .addTo(map)
    } else if (areas.length && inView.indexOf(areas[0].properties['Land Title Area']) < 0) {
      feature = dataIndex[areas[0].properties._id]
      map.fitBounds(geojsonExtent(feature), {padding: 20})
    }
  })
}

// Only return features with geometry
function filterGeom (fc) {
  return {
    type: 'FeatureCollection',
    features: fc.features.filter(function (f) { return f.geometry })
  }
}

function getZoom (map, feature, options) {
  var padding = (options && options.padding) || 0
  var maxZoom = (options && options.maxZoom) || 20

  var bounds = mapboxgl.LngLatBounds.convert(geojsonExtent(feature))

  var tr = map.transform
  var nw = tr.project(bounds.getNorthWest())
  var se = tr.project(bounds.getSouthEast())
  var size = se.sub(nw)
  var scaleX = (tr.width - padding * 2) / size.x
  var scaleY = (tr.height - padding * 2) / size.y

  return Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), maxZoom)
}

function unfurl (fc, index) {
  return {
    type: 'FeatureCollection',
    features: fc.features.map(function (f) {
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
  }
}

function arrayEqual (arr1, arr2) {
  if (arr1 === arr2) return true
  if (arr1.length !== arr2.length) return false
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }
  return true
}

function addZooms (map, fc) {
  return {
    type: 'FeatureCollection',
    features: fc.features.map(function (f) {
      var zoom = getZoom(map, f, {padding: 60})
      return Object.assign({}, f, {
        properties: Object.assign({}, f.properties, {_zoom: zoom})
      })
    })
  }
}

function addIds (fc) {
  return {
    type: 'FeatureCollection',
    features: fc.features.map(function (f) {
      return Object.assign({}, f, {
        properties: Object.assign({}, f.properties, {_id: f.id})
      })
    })
  }
}

function renderSettlementPopup (props) {
  var nationality = dataIndex[props.Nationality[0]].properties.Nationality
  var html = `<div style="max-width: 200px">
    <h1>${props.Settlement}</h1>
    <p>${props.Settlement} es un asentamiento ${nationality} de {num_familias}
    familias ubicado por {ubicacion}.</p>
    <p>Alianze Ceibo esta trabajando en este asentamiento con los programas de
    agua (${props['Water Installations']} sistemas instaladas) que sirve
    ${props['Water Families']} familias</p>
    </div>`
  if (props.Stories) {
    html += `<ul>${props.Stories.map(id => (
      `<li><a href="${dataIndex[id].properties.Link}">${dataIndex[id].properties.Title}</a></li>`
    )).join('\n')}</ul>`
  }
  return html
}

function renderMenu (items) {
  return `<form action="#">
    ${items.map(item => (
      `<div>
        <input type="checkbox" value="${item}" id="${item.replace(/\s/g, '-')}" checked />
        <label for="${item.replace(/\s/g, '-')}">${item}</label>
      </div>`
    )).join('\n')}
  </form>
  `
}
