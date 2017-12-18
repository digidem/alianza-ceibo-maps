module.exports = getPopupData

function getPopupData (data, id) {
  if (!data || !id || !data.byId[id]) return {}

  const feature = data.byId[id]
  let name

  switch (feature.properties._type) {
    case 'community':
      name = feature.properties._communityName
      break
    case 'area':
      name = feature.properties._areaName
      break
    default:
      return {}
  }

  return {
    name: name,
    solar: feature.stats.solar,
    water: feature.stats.water,
    color: feature.properties._color
  }
}
