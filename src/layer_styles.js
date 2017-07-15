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
  'maxzoom': 10.5,
  'layout': {
    'icon-allow-overlap': true,
    'icon-image': '{icon}-dot',
    'icon-size': {
      'base': 1.8,
      'stops': [
        [6, 0.15],
        [10, 0.5]
      ]
    }
  },
  paint: {
    'icon-opacity': {
      'base': 1,
      'stops': [
        [10, 1],
        [10.5, 0]
      ]
    }
  }
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
    'text-offset': [0, 0.7],
    'icon-size': {
      'base': 1.4,
      'stops': [
        [10, 0.2],
        [15, 0.7]
      ]
    },
    'text-anchor': 'top',
    'text-field': '{Comunidad}',
    'text-max-width': 6
  },
  'paint': {
    'icon-opacity': {
      'base': 1,
      'stops': [
        [10, 0],
        [10.5, 1]
      ]
    },
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
      'base': 1.8,
      'stops': [
        [6, 0.15],
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
    'icon-ignore-placement': true,
    'icon-size': {
      'base': 1.4,
      'stops': [
        [10, 0.25],
        [15, 0.75]
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
