const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default

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
  <ul class={classes.root}>
    {children}
  </ul>
)

SidebarList.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object.isRequired
}

module.exports = injectSheet(styles)(SidebarList)
