var getZoom = require('./lib/area_zoom')
var COLORS = require('../config.json').colors

module.exports = generateAreaLayers

function generateAreaLayers (map, areas) {
  var layers = {}
  areas.features.forEach(function (f) {
    var id = f.properties._id
    var zoom = getZoom(map, f, {padding: 60})
    layers[id] = {
      id: id,
      type: 'fill',
      source: 'areas',
      filter: ['==', '_id', id],
      paint: {
        'fill-color': COLORS[f.properties.nacionalidad],
        'fill-opacity': {
          stops: [
            [0, 0.5],
            [zoom - 2, 0.5],
            [zoom, 0.2]
          ]
        }
      }
    }
    layers[id + '-outline'] = {
      id: id + '-outline',
      type: 'line',
      source: 'areas',
      minzoom: zoom - 1,
      layout: {},
      paint: {
        'line-opacity': {
          stops: [
            [zoom - 1, 0],
            [zoom, 0.8]
          ]
        },
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
    layers[id + '-label'] = {
      id: id + '-label',
      source: 'areas',
      'type': 'symbol',
      'minzoom': zoom - 1,
      'layout': {
        'text-field': '{name}',
        'text-size': 16,
        'text-font': [
          'Open Sans Extrabold',
          'Arial Unicode MS Regular'
        ],
        'symbol-avoid-edges': true,
        'visibility': 'visible'
      },
      'paint': {
        'text-color': 'hsl(151, 87%, 14%)',
        'text-opacity': {
          stops: [
            [zoom - 1, 0],
            [zoom, 0.4]
          ]
        }
      }
    }
    layers[id + '-unlegalized'] = {
      'id': id + '-unlegalized',
      'type': 'fill',
      'source': 'areas',
      'filter': ['==', 'Legalizado', 0],
      'paint': {
        'fill-opacity': 0.2,
        'fill-pattern': 'cross-hatch'
      }
    }
  })
  return layers
}
