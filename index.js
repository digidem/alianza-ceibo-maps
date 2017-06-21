/* global mapboxgl, d3, geojsonExtent */

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var data
var areas
var dataIndex = {}
var maxPrograms = 0

var COLORS = {
  Cofan: '#168623',
  Siona: '#fee93f',
  Secoya: '#1a86e5',
  Waorani: '#7b271d'
}

var areaHighlightLayer = {
  id: 'alianza-areas-highlight',
  type: 'line',
  source: 'areas',
  filter: ['==', '_id', ''],
  layout: {},
  paint: {
    'line-opacity': 0.8,
    'line-color': {
      property: 'nacionalidad',
      type: 'categorical',
      stops: Object.keys(COLORS).map(function (key) {
        return [key, COLORS[key]]
      })
    },
    'line-width': 3
  }
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
    'text-optional': true,
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
    'text-field': '{Comunidad}',
    'text-max-width': 6
  },
  'paint': {
    'text-halo-color': 'hsla(0, 0%, 100%, 0.5)',
    'text-halo-blur': 0,
    'text-halo-width': 1
  }
}

var comunidadesLayerDotsHighlight = Object.assign({}, comunidadesLayerDots, {
  id: 'alianza-comunidades-dots-highlight',
  source: 'comunidades',
  filter: ['==', '_id', ''],
  layout: {},
  paint: Object.assign({}, comunidadesLayerDots.paint, {
    'circle-radius': {
      'base': 1.4,
      'stops': [
        [6, 1.1],
        [10, 6]
      ]
    }
  })
})

var comunidadesLayerHousesHighlight = Object.assign({}, comunidadesLayerHouses, {
  id: 'alianza-comunidades-houses-highlight',
  source: 'comunidades',
  filter: ['==', '_id', ''],
  layout: Object.assign({}, comunidadesLayerHouses.layout, {
    'icon-size': {
      'base': 1.2,
      'stops': [
        [10, 0.8],
        [13, 1.2]
      ]
    }
  })
})

var comunidadesInteractiveLayers = [
  'alianza-comunidades-dots',
  'alianza-comunidades-houses',
  'alianza-comunidades-dots-highlight',
  'alianza-comunidades-houses-highlight'
]

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

d3.json('areas/areas.geojson', function (err, _data) {
  if (err) return console.error(err)
  areas = _data
  areas.features.forEach(function (feature) {
    dataIndex[feature.properties._id] = feature
  })
  onLoad()
})

var menuDiv = document.createElement('div')

menuDiv.className = 'dd_map_menu'

document.getElementById('map').appendChild(menuDiv)

function onLoad () {
  if (--pending > 0) return
  var comunidades = addIds(unfurl(filterGeom(data['Comunidades']), dataIndex))
  var programas = getPrograms(comunidades)
  menuDiv.innerHTML = renderMenu(programas)

  var areaLayers = generateAreaLayers(map, areas)

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
  map.addLayer(areaHighlightLayer)
  map.addLayer(comunidadesLayerDots)
  map.addLayer(comunidadesLayerHouses)
  map.addLayer(comunidadesLayerDotsHighlight)
  map.addLayer(comunidadesLayerHousesHighlight)

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')

  map.fitBounds(geojsonExtent(areas), {padding: 20})

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
  })

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
    var areas = map.queryRenderedFeatures(e.point, { layers: Object.keys(areaLayers) })
    var comunidades = map.queryRenderedFeatures(e.point, { layers: comunidadesInteractiveLayers })
    var areaClicked = areas && areas[0] && map.getZoom() < areas[0].layer.maxzoom && areas[0]
    var communityClicked = comunidades && comunidades[0]

    if (communityClicked) {
      var feature = dataIndex[communityClicked.properties._id]
      popup.setLngLat(feature.geometry.coordinates)
        .setHTML(renderComunidadPopup(feature.properties))
        .addTo(map)
    } else {
      popup.remove()
    }

    if (areaClicked) {
      var area = dataIndex[areaClicked.properties._id]
      map.fitBounds(geojsonExtent(area), {padding: 20})
      map.setFilter('alianza-areas-highlight', ['==', '_id', ''])
    }
  })
}

// Only return features with geometry
function filterGeom (featureCollection) {
  var featuresWithGeom = featureCollection.features.filter(function (f) { return f.geometry })
  return fc(featuresWithGeom)
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

function renderComunidadPopup (props) {
  var nacionalidad = dataIndex[props.Nacionalidad[0]].properties.Nacionalidad
  var fotoUrl = props.Foto && props.Foto[0] && props.Foto[0].thumbnails.large.url
  var desc = props.Descripción || 'Description pending'
  var programas = props.Programas || []
  var html = `<div class='popup-wrapper'>
    ${!fotoUrl ? `` : `<img src=${fotoUrl}>`}
    <div class='popup-inner'>
      <h1>${props.Comunidad}</h1>
      <p>${desc}</p>
      <ul>
        ${programas.map(function (p) {
          return `<li>${p}</li>`
        }).join('\n')}
      </ul>
    </div>
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

function fc (features) {
  return {
    type: 'FeatureCollection',
    features: features
  }
}

function getPrograms (featureCollection) {
  var programs = {}
  featureCollection.features.forEach(function (f) {
    var programas = f.properties.Programas
    if (!Array.isArray(programas)) programas = [programas]
    programas.forEach(function (p) {
      programs[p] = true
    })
  })
  return Object.keys(programs)
}

// Mutates input featureCollection
function flattenPrograms (featureCollection) {
  featureCollection.features.forEach(function (f) {
    var programas = f.properties.Programas
    if (!Array.isArray(programas)) {
      programas = f.properties.Programas = [programas]
    }
    programas.forEach(function (p, i) {
      f.properties['Programas.' + i] = p
      maxPrograms = Math.max(maxPrograms, i)
    })
  })
  return featureCollection
}

function getFilter (maxPrograms, selection) {
  var filter = ['any']
  for (var i = 0; i < maxPrograms; i++) {
    filter.push(['in', 'Programas.' + i].concat(selection))
  }
  return filter
}

function generateAreaLayers (map, areas) {
  var layers = {}
  areas.features.forEach(function (f) {
    var id = f.properties._id
    var zoom = getZoom(map, f, {padding: 60})
    layers[id] = {
      id: id,
      type: 'fill',
      source: 'areas',
      maxzoom: zoom - 0.09,
      filter: ['==', '_id', id],
      paint: {
        'fill-color': COLORS[f.properties.nacionalidad],
        'fill-opacity': {
          stops: [
            [0, 0.5],
            [zoom - 2, 0.5],
            [zoom - 0.1, 0]
          ]
        }
      }
    }
  })
  return layers
}
