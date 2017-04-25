function getLayerWithZooms (map, areas, layer) {
  var stops = []
  areas.features.forEach(function (f) {
    var id = f.properties._id
    var zoom = getZoom(map, f, {padding: 60})
    // stops.push([{zoom: 0, value: id}, 0.5])
    stops.push([{zoom: zoom, value: id}, 0.5])
    stops.push([{zoom: zoom + 2, value: id}, 0])
  })
  stops = stops.sort(function (a, b) {
    return a[0].zoom - b[0].zoom
  })
  return Object.assign({}, layer, {
    paint: Object.assign({}, layer.paint, {
      'fill-opacity': {
        type: 'interval',
        property: '_id',
        stops: stops
      }
    })
  })
}
