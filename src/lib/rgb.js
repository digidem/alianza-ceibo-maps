var toRGB = require('hex-rgb')
/**
 * Normalize area colors for the map.
 * @param  {String} color The original color set in the data.
 * @return {String}       An RGB represented color string (e.g., 255,234,210).
 */
module.exports = function (color) {
  if (color.indexOf('rgb') > -1) return color.replace('rgb(', '').replace(')', '')
  else return toRGB(color)
}
