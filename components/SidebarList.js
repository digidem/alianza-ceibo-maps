import React from 'react'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'

const styles = {
  root: {
    flex: '1 1 auto',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    position: 'relative'
  }
}

const SidebarList = ({children, classes}) => (
  <ul className={classes.root}>
    {children}
  </ul>
)

SidebarList.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object.isRequired
}

module.exports = injectSheet(styles)(SidebarList)
