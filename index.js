/* global mapboxgl, d3, geojsonExtent */

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var data
var areas
var dataIndex = {}
var inView = []

var areasFillColor = {
  property: 'nacionalidad',
  type: 'categorical',
  stops: [
    ['Cofan', '#168623'],
    ['Siona', '#fee93f'],
    ['Secoya', '#1a86e5'],
    ['Waorani', '#7b271d']
  ]
}

var areasLayer = {
  id: 'alianza-areas',
  type: 'fill',
  source: 'areas',
  layout: {},
  paint: {
    'fill-color': areasFillColor,
    'fill-opacity': 0.5
  }
}

var areasLayerHighlight = {
  id: 'alianza-areas-highlight',
  type: 'fill',
  source: 'areas',
  layout: {},
  paint: {
    'fill-color': areasFillColor,
    'fill-opacity': 0.7
  },
  filter: ['==', '_id', '']
}

var comunidadesLayerDots = {
  'id': 'alianza-comunidades-dots',
  'type': 'circle',
  'source': 'comunidades',
  'maxzoom': 10,
  'layout': {},
  'paint': {
    'circle-color': '#5b310b',
    'circle-radius': {
      'base': 1.4,
      'stops': [
        [6, 1],
        [10, 5]
      ]
    }
  }
}

var comunidadesLayerHouses = {
  'id': 'alianza-comunidades-houses',
  'type': 'symbol',
  'source': 'comunidades',
  'minzoom': 10,
  'layout': {
    'text-size': {
      'base': 1,
      'stops': [
        [10, 9],
        [14, 12]
      ]
    },
    'icon-image': 'comunidad',
    'text-ignore-placement': true,
    'text-font': [
      'DIN Offc Pro Regular',
      'Arial Unicode MS Regular'
    ],
    'visibility': 'visible',
    'text-offset': {
      'base': 1.2,
      'stops': [
        [10, [0, 0.7]],
        [13, [0, 1.1]]
      ]
    },
    'icon-size': {
      'base': 1.2,
      'stops': [
        [10, 0.6],
        [13, 1]
      ]
    },
    'text-anchor': 'top',
    'text-field': '{name}',
    'text-max-width': 6
  },
  'paint': {
    'text-halo-color': 'hsla(0, 0%, 100%, 0.5)',
    'text-halo-blur': 0,
    'text-halo-width': 1
  }
}

var pending = 3

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

d3.json('areas/areas.geojson', function (err, _data) {
  if (err) return console.error(err)
  areas = _data
  areas.features.forEach(function (feature) {
    dataIndex[feature.properties._id] = feature
  })
  onLoad()
})

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

function onLoad () {
  if (--pending > 0) return
  var comunidades = addIds(unfurl(filterGeom(data['Comunidades']), dataIndex))
  areasLayer = getLayerWithZooms(map, areas, areasLayer)
  areasLayerHighlight = getLayerWithZooms(map, areas, areasLayerHighlight)
  map.addSource('comunidades', {
    type: 'geojson',
    data: comunidades
  })
  map.addSource('areas', {
    type: 'geojson',
    data: areas
  })
  map.addLayer(areasLayer)
  map.addLayer(areasLayerHighlight)
  map.addLayer(comunidadesLayerDots)
  map.addLayer(comunidadesLayerHouses)

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')

  map.fitBounds(geojsonExtent(areas), {padding: 20})

  map.on('move', function () {
    // map.setFilter('alianza-areas', ['>', '_zoom', map.getZoom() - 1])
  })

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true
  })

  map.on('mousemove', function (e) {
    var areas = map.queryRenderedFeatures(e.point, { layers: ['alianza-areas'] })
    var comunidades = map.queryRenderedFeatures(e.point, { layers: ['alianza-comunidades-dots', 'alianza-comunidades-houses'] })

    if (!comunidades.length && (!areas.length || inView.indexOf(areas[0].properties['Land Title Area']) > -1)) {
      map.getCanvas().style.cursor = ''
      map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
      return
    }
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer'
    if (comunidades.length) return
    map.setFilter('alianza-areas-highlight', ['==', '_id', areas[0].properties._id])
  })

  map.on('click', function (e) {
    var areas = map.queryRenderedFeatures(e.point, { layers: ['alianza-areas'] })
    var comunidades = map.queryRenderedFeatures(e.point, { layers: ['alianza-comunidades-dots', 'alianza-comunidades-houses'] })
    var feature
    console.log(comunidades)
    if (comunidades.length) {
      feature = dataIndex[comunidades[0].properties._id]
      popup.setLngLat(feature.geometry.coordinates)
        .setHTML(renderComunidadPopup(feature.properties))
        .addTo(map)
    } else if (areas.length && inView.indexOf(areas[0].properties['Land Title Area']) < 0) {
      var area = dataIndex[areas[0].properties._id]
      map.fitBounds(geojsonExtent(area), {padding: 20})
      map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
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

// function addZooms (map, fc) {
//   return {
//     type: 'FeatureCollection',
//     features: fc.features.map(function (f) {
//       var zoom = getZoom(map, f, {padding: 60})
//       return Object.assign({}, f, {
//         properties: Object.assign({}, f.properties, {_zoom: zoom})
//       })
//     })
//   }
// }

function getLayerWithZooms (map, areas, layer) {
  var zoom = getZoom(map, areas, {padding: 20})
  return Object.assign({}, layer, {
    maxzoom: zoom + 3,
    paint: Object.assign({}, layer.paint, {
      'fill-opacity': {
        stops: [
          [0, layer.paint['fill-opacity']],
          [zoom + 1, layer.paint['fill-opacity']],
          [zoom + 3, 0]
        ]
      }
    })
  })
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

function renderComunidadPopup (props) {
  var nacionalidad = dataIndex[props.Nacionalidad[0]].properties.Nacionalidad
  var html = `<div style="max-width: 200px">
    <h1>${props.Comunidad}</h1>
    <p>${props.Comunidad} es un asentamiento ${nacionalidad} de {num_familias}
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

// Make a FeatureCollection
function fc (features) {
  return {
    type: 'FeatureCollection',
    features: features
  }
}
