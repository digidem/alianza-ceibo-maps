
var areasLine = {
  id: 'alianza-areas-line',
  type: 'line',
  source: 'areas',
  layout: {},
  paint: {
    'line-opacity': 1,
    'line-color': ['get', '_color'],
    'line-width': 1
  }
}

var areasFill = {
  id: 'alianza-areas-fill',
  type: 'fill',
  source: 'areas',
  layout: {},
  paint: {
    'fill-opacity': [
      'interpolate', ['linear'], ['zoom'],
      6, 0.8,
      10, 0
    ],
    'fill-color': ['get', '_color']
  }
}

var areasHighlight = {
  id: 'alianza-areas-highlight',
  type: 'line',
  source: 'areas',
  filter: ['==', '_id', ''],
  layout: {},
  paint: {
    'line-opacity': 0.8,
    'line-color': ['get', '_color'],
    'line-width': 3
  }
}

var communitiesDots = {
  'id': 'alianza-communities-dots',
  'type': 'symbol',
  'source': 'communities',
  'maxzoom': 11,
  'layout': {
    'icon-allow-overlap': true,
    'icon-image': ['concat', ['get', '_icon'], '-dot'],
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

var communitiesHouses = {
  'id': 'alianza-communities-houses',
  'type': 'symbol',
  'source': 'communities',
  'minzoom': 10,
  'layout': {
    'text-size': {
      'base': 1,
      'stops': [
        [10, 9],
        [14, 12]
      ]
    },
    'icon-allow-overlap': true,
    'icon-image': ['get', '_icon'],
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

var communitiesDotsHighlight = Object.assign({}, communitiesDots, {
  id: 'alianza-communities-dots-highlight',
  source: 'communities',
  filter: ['==', '_id', ''],
  paint: {},
  layout: Object.assign({}, communitiesDots.layout, {
    'icon-size': {
      'base': 1.8,
      'stops': [
        [6, 0.15],
        [10, 0.6]
      ]
    }
  })
})

var communitiesHousesHighlight = Object.assign({}, communitiesHouses, {
  id: 'alianza-communities-houses-highlight',
  source: 'communities',
  filter: ['==', '_id', ''],
  layout: Object.assign({}, communitiesHouses.layout, {
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

var bingSatellite = {
  id: 'bing',
  type: 'raster',
  source: 'bing',
  paint: {
    'raster-fade-duration': 500,
    'raster-opacity': {
      stops: [
        [7, 1],
        [7.5, 0]
      ]
    }
  }
}

module.exports = {
  areasFill: areasFill,
  areasLine: areasLine,
  areasHighlight: areasHighlight,
  bingSatellite: bingSatellite,
  communitiesDots: communitiesDots,
  communitiesHouses: communitiesHouses,
  communitiesDotsHighlight: communitiesDotsHighlight,
  communitiesHousesHighlight: communitiesHousesHighlight
}
