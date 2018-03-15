import PropTypes from 'prop-types'
import React from 'react'

import { Link as ReactLink } from 'react-router-dom'

const Link = ({to, className, children, ...other}) => (
  <ReactLink className={className} to={`${to}${window.location.search}`} {...other}>
    {children}
  </ReactLink>
)

Link.propTypes = {
  to: PropTypes.string.isRequired,
  className: PropTypes.string
}

module.exports = Link
