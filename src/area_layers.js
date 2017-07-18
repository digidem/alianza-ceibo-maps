const mapboxgl = require('mapbox-gl')
const extent = require('@mapbox/geojson-extent')

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
  })
  return layers
}

function getZoom (map, feature, options) {
  var padding = (options && options.padding) || 0
  var maxZoom = (options && options.maxZoom) || 20

  var bounds = mapboxgl.LngLatBounds.convert(extent(feature))

  var tr = map.transform
  var nw = tr.project(bounds.getNorthWest())
  var se = tr.project(bounds.getSouthEast())
  var size = se.sub(nw)
  var scaleX = (tr.width - padding * 2) / size.x
  var scaleY = (tr.height - padding * 2) / size.y

  return Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), maxZoom)
}
