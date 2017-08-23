const yo = require('yo-yo')
const mapboxgl = require('mapbox-gl')

module.exports = Popup

function Popup (map, opts) {
  if (!(this instanceof Popup)) return new Popup(map)
  this.map = map
  this.popup = new mapboxgl.Popup(opts || {
    closeButton: false,
    closeOnClick: false
  })
  this.popupNode = yo`<div></div>`
  this.popup.setDOMContent(this.popupNode)

  // Clear previous IMG before updating to new image
  // Avoids initial load of previous popup image before new image loads
  this.yoOptions = {
    onBeforeElUpdated: function (fromEl) {
      if (fromEl.tagName.toUpperCase() === 'IMG') {
        fromEl.src = ''
      }
    }
  }
}

Popup.prototype.update = function (dom) {
  yo.update(this.popupNode, dom, this.yoOptions)
}

Popup.prototype.remove = function () {
  this.popup.remove()
}

Popup.prototype.setLngLat = function (lngLat) {
  this.popup.setLngLat(lngLat).addTo(this.map)
}
