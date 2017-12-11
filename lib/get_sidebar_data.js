const gett = require('../lib/get_translations')

const t = {
  en: {
    homeTitle: 'Where We Work',
    homeListTitle: 'Who We Work With',
    homeText: `Our focus on building solutions is not about quick technological fixes,
      nor the naïve belief in the power of "good intentions" to resolve a deep
      human health, social and environmental crisis, but rather it is about working
      side-by-side with indigenous peoples struggling to secure life’s basic
      necessities in a first imperiled by the industrial frontier.`
  },
  es: {
    homeTitle: 'Dónde Trabajamos',
    homeListTitle: 'Con Quién Trabajamos'
  }
}

module.exports = {
  home: getHomeData,
  nation: getNationData,
  area: getAreaData,
  community: getCommunityData
}

function getHomeData (data) {
  const {nations, stats} = data

  const list = Object.keys(nations).map(key => ({
    name: nations[key].properties._nationName,
    solar: nations[key].stats.solar,
    water: nations[key].stats.water,
    color: nations[key].properties._color,
    image: nations[key].properties.Foto &&
      nations[key].properties.Foto[0].thumbnails.large.url
  })).filter(nation => nation.name !== 'Kichwa')

  return {
    title: gett(t).homeTitle,
    image: '/sidebar.jpg',
    text: gett(t).homeText,
    solar: stats.solar,
    water: stats.water,
    listTitle: gett(t).homeListTitle,
    list: list
  }
}

function getNationData (data, nationName) {
  const nation = data.nations[nationName]
  if (!nation) return

  const {communities, stats} = nation

  const list = Object.keys(communities).map(key => ({
    name: communities[key].properties._communityName,
    baseUrl: '/' + enc(communities[key].properties._nationName) + '/' +
      (enc(communities[key].properties._areaName) || '_'),
    featured: communities[key].properties.Historias &&
      !!communities[key].properties.Historias.length,
    solar: communities[key].stats.solar,
    water: communities[key].stats.water,
    color: communities[key].properties._color,
    image: communities[key].properties.Foto &&
      communities[key].properties.Foto[0].thumbnails.large.url
  }))

  return {
    title: nation.properties._nationName,
    image: nation.properties.Foto &&
      nation.properties.Foto[0].thumbnails.large.url,
    text: nation.properties.Resumen,
    solar: stats.solar,
    water: stats.water,
    listTitle: nationName + ' Communities',
    list: list
  }
}

function getAreaData (data, areaName) {
  const area = data.areas[areaName]
  if (!area) return

  const {communities, stats} = area

  const list = Object.keys(communities).map(key => ({
    name: communities[key].properties._communityName,
    baseUrl: '/' + enc(communities[key].properties._nationName) + '/' +
      (enc(communities[key].properties._areaName) || '_'),
    featured: communities[key].properties.Historias &&
      !!communities[key].properties.Historias.length,
    solar: communities[key].stats.solar,
    water: communities[key].stats.water,
    color: communities[key].properties._color,
    image: communities[key].properties.Foto &&
      communities[key].properties.Foto[0].thumbnails.large.url
  }))

  // For areas we include the nation name in the title, unless if
  // the area name already includes the nation name
  let title = area.properties._areaName
  const nationName = area.properties._nationName
  if (title.indexOf(nationName) !== 0) title = nationName + ': ' + title

  // Include the text from the nation too for areas
  let text = area.properties.Resumen
  const nationText = data.nations[nationName].properties.Resumen
  if (nationText) text = nationText + (text ? '\n\n' + text : '')

  return {
    title: title,
    image: area.properties.Foto &&
      area.properties.Foto[0].thumbnails.large.url,
    text: text,
    solar: stats.solar,
    water: stats.water,
    listTitle: 'Communities in ' + areaName,
    list: list
  }
}

function getCommunityData (data, nationName, communityName) {
  const nation = data.nations[nationName]
  if (!nation) return
  const community = nation.communities[communityName]
  if (!community) return

  const stories = (community.properties.Historias || [])
    .map(storyId => data.byId[storyId])
    // filter out undefined values
    .filter(Boolean)

  const list = Object.keys(stories).map(key => ({
    name: stories[key].properties.Titulo,
    url: stories[key].properties.Vinculo,
    image: stories[key].properties.Foto &&
      stories[key].properties.Foto[0].thumbnails.large.url
  }))

  return {
    title: community.properties._communityName,
    image: community.properties.Foto &&
      community.properties.Foto[0].thumbnails.large.url,
    text: community.properties.Resumen,
    solar: community.stats.solar,
    water: community.stats.water,
    listTitle: 'Stories',
    list: list,
    stories: true
  }
}

// Some names include a `/`, which needs to be encoded for route paths to work
function enc (str) {
  return str && window.encodeURIComponent(str)
}
