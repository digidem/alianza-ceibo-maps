const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default
const mapboxgl = require('mapbox-gl')
const extent = require('@mapbox/geojson-extent')

const layerStyles = require('../lib/layer_styles')

// import deepEqual from 'deep-equal'
// import assign from 'object-assign'
// import featureFilter from 'feature-filter-geojson'

/* Mapbox [API access token](https://www.mapbox.com/help/create-api-access-token/) */
mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

const MAP_STYLE = 'mapbox://styles/gmaclennan/cjb1e10ya5lwl2sr0hqbzo2l8'
// const MAP_STYLE = 'http://localhost:8080/style.json'

const bingSource = {
  type: 'raster',
  tiles: [
    'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869'
  ],
  minzoom: 1,
  maxzoom: 21,
  tileSize: 256
}

const styles = {
  root: {
    width: '100%',
    height: '100%'
  }
}

class MapView extends React.Component {
  state = {}

  // The first time our component mounts, render a new map into `mapContainer`
  // with settings from props.
  componentDidMount () {
    const map = window.map = this.map = new mapboxgl.Map({
      style: MAP_STYLE,
      hash: true,
      bounds: [-82.573242, -5.287887, -74.750977, 1.834403],
      container: this.mapContainer
      // center: [-78.415, -1.639],
      // zoom: 6
    })

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl(), 'top-left')
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    map.on('click', 'alianza-areas-fill', this.handleClick)
    map.on('mousemove', 'alianza-areas-fill', this.handleMouseEnter)
    map.on('mouseleave', 'alianza-areas-fill', this.handleMouseLeave)
    map.on('click', 'alianza-communities-dots', this.handleClick)
    map.on('mousemove', 'alianza-communities-dots', this.handleMouseEnter)
    map.on('mouseleave', 'alianza-communities-dots', this.handleMouseLeave)
    map.on('click', 'alianza-communities-houses', this.handleClick)
    map.on('mousemove', 'alianza-communities-houses', this.handleMouseEnter)
    map.on('mouseleave', 'alianza-communities-houses', this.handleMouseLeave)
    map.once('load', () => {
      console.log('loaded')
    })
  }

  componentWillReceiveProps ({data, nation, area, community, hover, location}) {
    const map = this.map
    if (!map) return

    if (!data) return

    if (data && data !== this.props.data) {
      this.ready(() => {
        map.addSource('areas', {
          type: 'geojson',
          data: this.getAreaGeoJSON(data)
        })
        map.addSource('communities', {
          type: 'geojson',
          data: this.getCommunityGeoJSON(data)
        })
        map.addSource('bing', bingSource)
        map.addLayer(layerStyles.bingSatellite, 'aerialway')
        map.addLayer(layerStyles.areasLine)
        map.addLayer(layerStyles.areasFill)
        map.addLayer(layerStyles.communitiesHouses)
        map.addLayer(layerStyles.communitiesDots)
        this.zoomToData(data, nation, area, community)
      })
    }

    // Navigation event
    if (location !== this.props.location) {
      this.zoomToData(data, nation, area, community)
    }

    if (hover) {
      map.getCanvas().parentNode.style.cursor = 'pointer'
    } else {
      map.getCanvas().parentNode.style.cursor = ''
    }
  }

  shouldComponentUpdate () {
    return false
  }

  componentWillUnmount () {
    // this.map.off('moveend', this.handleMapMoveOrZoom)
    this.map.off('click', this.handleClick)
    // this.map.off('mousemove', this.handleMouseMove)
    this.map.remove()
  }

  handleClick = (e) => {
    const id = e.features[0].properties._id
    this.props.onClick(id)
  }

  handleMouseEnter = (e) => {
    const id = e.features[0].properties._id
    this.props.onHover(id)
  }

  handleMouseLeave = (e) => {
    this.props.onHover()
  }

  zoomToData (data, nation, area, community) {
    const map = this.map

    if (!nation && !area && !community) {
      return map.fitBounds(data.bbox, {padding: 20})
    }

    const nationFeature = data.nations[nation]
    if (!nationFeature) return

    if (nation && community) {
      const communityFeature = nationFeature.communities[community]
      if (!communityFeature) return
      return map.flyTo({
        center: communityFeature.geometry.coordinates,
        zoom: 15
      })
    }

    if (nation && area) {
      const areaFeature = data.areas[area]
      if (!areaFeature) return
      return map.fitBounds(areaFeature.bbox, {padding: 20})
    }

    if (nation) {
      return map.fitBounds(nationFeature.bbox, {padding: 20})
    }
  }

  getAreaGeoJSON (data) {
    const areaFeatures = Object.keys(data.areas)
      .map(key => data.areas[key])

    areaFeatures.forEach(feature => (feature.properties._zoom = this.getZoom(feature)))

    return {
      type: 'FeatureCollection',
      features: areaFeatures
    }
  }

  getCommunityGeoJSON (data) {
    const communityFeatures = Object.keys(data.byId)
      .map(key => data.byId[key])
      .filter(f => f.properties._type === 'community')

    communityFeatures.forEach(f => {
      const area = data.areas[f.properties._areaName]
      if (!area) f.properties._zoom = 10
      else f.properties._zoom = area.properties._zoom
    })

    return {
      type: 'FeatureCollection',
      features: communityFeatures
    }
  }

  getZoom (feature) {
    var padding = 20
    var maxZoom = 18

    var bounds = mapboxgl.LngLatBounds.convert(extent(feature))

    var tr = this.map.transform
    var nw = tr.project(bounds.getNorthWest())
    var se = tr.project(bounds.getSouthEast())
    var size = se.sub(nw)
    var scaleX = (tr.width - padding * 2) / size.x
    var scaleY = (tr.height - padding * 2) / size.y

    return Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), maxZoom)
  }

  ready (fn) {
    if (this.map.loaded() && !this._styleDirty) {
      fn()
    } else {
      this.map.once('load', () => fn.call(this))
    }
  }

  render () {
    const {classes} = this.props
    return (
      <div className={classes.root} ref={(el) => (this.mapContainer = el)} />
    )
  }
}

module.exports = injectSheet(styles)(MapView)
