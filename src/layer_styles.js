var COLORS = require('../config.json').colors

var areaHighlight = {
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

var comunidadesDots = {
  'id': 'alianza-comunidades-dots',
  'type': 'symbol',
  'source': 'comunidades',
  'maxzoom': 10,
  'layout': {
    'icon-image': '{icon}-dot',
    'icon-size': {
      'base': 1,
      'stops': [
        [6, 0.3],
        [10, 0.5]
      ]
    }
  },
  paint: {}
}

var comunidadesHouses = {
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
    'icon-image': '{icon}',
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

var comunidadesDotsHighlight = Object.assign({}, comunidadesDots, {
  id: 'alianza-comunidades-dots-highlight',
  source: 'comunidades',
  filter: ['==', '_id', ''],
  paint: {},
  layout: Object.assign({}, comunidadesDots.layout, {
    'icon-size': {
      'base': 1,
      'stops': [
        [6, 0.4],
        [10, 0.6]
      ]
    }
  })
})

var comunidadesHousesHighlight = Object.assign({}, comunidadesHouses, {
  id: 'alianza-comunidades-houses-highlight',
  source: 'comunidades',
  filter: ['==', '_id', ''],
  layout: Object.assign({}, comunidadesHouses.layout, {
    'icon-size': {
      'base': 1.2,
      'stops': [
        [10, 0.8],
        [13, 1.2]
      ]
    }
  })
})

module.exports = {
  areaHighlight: areaHighlight,
  comunidadesDots: comunidadesDots,
  comunidadesHouses: comunidadesHouses,
  comunidadesDotsHighlight: comunidadesDotsHighlight,
  comunidadesHousesHighlight: comunidadesHousesHighlight
}
