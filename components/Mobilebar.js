import React from 'react'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { defineMessages, FormattedMessage } from 'react-intl'

import Typography from './Typography'

const messages = defineMessages({
  // Link to zoom out to whole map
  zoomout: 'Zoom out',
  // Links to toggle between map and list view
  listView: 'View Community List',
  mapView: 'View in Map',
  // Map legend button label
  closeLegend: 'Close Legend',
  legend: 'Legend',
  // Map legend item: communities with water installations
  water: 'Water Installations',
  // Map legend item: communities with solar installations
  solar: 'Solar Installations',
  // Map legend item: communities with water and solar installations
  waterSolar: 'Water & Solar Installations',
  // Map legend item: communities with a story
  story: 'Communities With Story'
})

var mobilebarHeight = 50

const styles = {
  root: {
    maxHeight: mobilebarHeight,
    backgroundColor: 'rgba(51, 51, 51, 1)'
  },
  link: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
      cursor: 'pointer'
    }
  },
  active: {
    color: '#ffffff'
  },
  mobilebar: {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-around'
  },
  mobilebarItem: {
    padding: '1rem 0',
    borderLeft: '1px solid #333333',
    color: '#999999',
    '&:hover': {
      color: '#cccccc'
    }
  },
  legendButton: {
    top: 0,
    color: 'rgb(40,40,40,1)',
    right: 0,
    padding: '9px',
    position: 'fixed',
    'background-color': 'white',
    margin: '10px',
    'border-radius': '5px',
    border: '1px solid white'
  },
  legend: {
    overflow: 'auto',
    height: '0'
  },
  legendInner: {
    overflow: 'auto',
    backgroundColor: 'rgba(0,0,0,0.85)',
    transform: 'translateY(100%)',
    transition: 'transform 200ms ease'
  },
  open: {
    position: 'fixed',
    'z-index': 999,
    width: '100%',
    left: 0,
    bottom: mobilebarHeight,
    height: 'auto',
    '& $legendInner': {
      transform: 'translateY(0)'
    }
  },
  legendList: {
    margin: '1rem 1.25rem',
    padding: 0,
    listStyle: 'none'
  },
  legendDivider: {
    backgroundColor: '#000000',
    height: 1,
    border: 'none'
  }
}

const legendItemStyles = {
  root: {
    display: 'flex',
    padding: 0,
    margin: '1rem 0',
    alignItems: 'center'
  },
  icon: {
    display: 'block',
    marginRight: '0.75rem',
    width: '1rem'
  },
  colorPatch: {
    marginRight: '0.75rem',
    border: '1px solid #ffffff',
    width: '1rem',
    height: '1rem'
  }
}

const LegendItem = injectSheet(legendItemStyles)(({icon, color, text, classes}) => (
  <li className={classes.root}>
    {icon && <img src={icon} className={classes.icon} />}
    {color && <div className={classes.colorPatch} style={{backgroundColor: color}} />}
    <Typography type='legendItem'>{text}</Typography>
  </li>
))

LegendItem.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  text: PropTypes.node.isRequired
}

class Mobilebar extends React.Component {
  state = {
    legendOpen: false
  }

  render () {
    const {nationList, className, classes, page} = this.props
    const {legendOpen} = this.state
    const legendClassName = classNames(classes.legend, {[classes.open]: legendOpen})
    return <div className={classes.root + ' ' + className}>
      <div className={legendClassName}>
        <div className={classes.legendInner}>
          <ul className={classes.legendList}>
            <LegendItem text={<FormattedMessage {...messages.water} />} icon='/icons/comunidad-agua-dot.svg' />
            <LegendItem text={<FormattedMessage {...messages.solar} />} icon='/icons/comunidad-solar-dot.svg' />
            <LegendItem text={<FormattedMessage {...messages.waterSolar} />} icon='/icons/comunidad-agua-solar-dot.svg' />
            <LegendItem text={<FormattedMessage {...messages.story} />} icon='/icons/star.svg' />
            <hr className={classes.legendDivider} />
            {nationList.map(nation => (
              <LegendItem key={nation.name} text={nation.name} color={nation.color} />
            ))}
          </ul>
        </div>
      </div>
      {page === 'mapView' && <Typography type='sectionTitle' className={classNames(classes.legendButton)}>
        <div className={classNames(classes.link)} onClick={() => this.setState({legendOpen: !legendOpen})}>
          {legendOpen ? <FormattedMessage {...messages.closeLegend} /> : <FormattedMessage {...messages.legend} />}
        </div>
      </Typography>}
      <div className={classes.mobilebar}>
        {page === 'listView' ? <Typography type='sectionTitle' className={classes.mobilebarItem}>
          <div className={classNames(classes.link)} onClick={this.props.handleMapPageClick}>
            <FormattedMessage {...messages.mapView} />
          </div>
        </Typography> : <Typography type='sectionTitle' className={classes.mobilebarItem}>
          <div className={classNames(classes.link)} onClick={this.props.handleListPageClick}>
            <FormattedMessage {...messages.listView} />
          </div>
        </Typography>}
      </div>
    </div>
  }
}

Mobilebar.propTypes = {
  /* List of nationalities on map */
  page: PropTypes.string,
  handleMapMenuClick: PropTypes.func,
  handleListMenuClick: PropTypes.func,
  nationList: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })),
  classes: PropTypes.object.isRequired
}

Mobilebar.defaultProps = {
  nationList: []
}

module.exports = injectSheet(styles)(Mobilebar)
