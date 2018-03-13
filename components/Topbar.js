import React from 'react'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { defineMessages, FormattedMessage } from 'react-intl'

import Typography from './Typography'

const messages = defineMessages({
  // Link in top bar to zoom out to whole map
  overview: 'Map Overview',
  // Map legend button label
  legend: 'Map Legend',
  // Map legend item: communities with water installations
  water: 'Water Installations',
  // Map legend item: communities with solar installations
  solar: 'Solar Installations',
  // Map legend item: communities with water and solar installations
  waterSolar: 'Water & Solar Installations',
  // Map legend item: communities with a story
  story: 'Communities With Story'
})

const styles = {
  root: {
    maxHeight: '3.0625rem',
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 1.25rem'
  },
  link: {
    color: '#999999',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: '#cccccc',
      cursor: 'pointer'
    }
  },
  active: {
    color: '#ffffff'
  },
  topbarItem: {
    padding: '1rem 0'
  },
  legendButton: {
    borderLeft: '1px solid #333333',
    borderRight: '1px solid #333333',
    userSelect: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1.25rem',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: 'rgba(0,0,0,0.2)'
    }
  },
  legendIcon: {
    width: '0.625rem',
    transition: 'transform 200ms ease'
  },
  collapse: {
    transform: 'rotate(180deg)'
  },
  legend: {
    overflow: 'auto',
    height: 0
  },
  legendInner: {
    overflow: 'auto',
    backgroundColor: 'rgba(0,0,0,0.85)',
    transform: 'translateY(-100%)',
    transition: 'transform 200ms ease'
  },
  open: {
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

const Breadcrumb = ({last, text, to, classes}) => (
  <span>{' / '}{last
  ? <span className={classes.active}>{text}</span>
  : <Link className={classes.link} to={to}>{text}</Link>}
  </span>
)

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

class Topbar extends React.Component {
  state = {
    legendOpen: false
  }

  render () {
    const {nation, area, community, nationList, className, classes, show} = this.props
    const {legendOpen} = this.state
    const legendIconClassName = classNames(classes.legendIcon, {[classes.collapse]: legendOpen})
    const legendClassName = classNames(classes.legend, {[classes.open]: legendOpen})
    return <div className={classes.root + ' ' + className}>
      <div>
        <Typography type='sectionTitle' color='#999999' className={classes.topbarItem}>
          <Link className={classNames(classes.link, {[classes.active]: !nation})} to='/'>
            <FormattedMessage {...messages.overview} />
          </Link>
          <span>
            {!!nation && <Breadcrumb last={!area} text={nation} to={`/${nation}`} classes={classes} />}
            {!!nation && !!area && area !== '_' &&
              <Breadcrumb last={!community} text={area} to={`/${nation}/${area}`} classes={classes} />}
            {!!nation && !!area && !!community &&
              <Breadcrumb last text={community} classes={classes} />}
          </span>
        </Typography>
      </div>
      <div>
        <div className={classes.legendButton} onClick={() => this.setState({legendOpen: !legendOpen})}>
          <Typography type='sectionTitle' color='#999999' className={classes.topbarItem}>
            <FormattedMessage {...messages.legend} />
          </Typography>
          <img className={legendIconClassName} src='/icons/expand.svg' />
        </div>
        <div className={legendClassName}>
          <div className={classes.legendInner}>
            <ul className={classes.legendList}>
              {show !== 'solar' && <LegendItem text={<FormattedMessage {...messages.water} />} icon='/icons/comunidad-agua-dot.svg' />}
              {show !== 'agua' && <LegendItem text={<FormattedMessage {...messages.solar} />} icon='/icons/comunidad-solar-dot.svg' />}
              {!show && <LegendItem text={<FormattedMessage {...messages.waterSolar} />} icon='/icons/comunidad-agua-solar-dot.svg' />}
              <LegendItem text={<FormattedMessage {...messages.story} />} icon='/icons/star.svg' />
              <hr className={classes.legendDivider} />
              {nationList.map(nation => (
                <LegendItem key={nation.name} text={nation.name} color={nation.color} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  }
}

Topbar.propTypes = {
  nation: PropTypes.string,
  area: PropTypes.string,
  community: PropTypes.string,
  /* List of nationalities on map */
  nationList: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })),
  classes: PropTypes.object.isRequired
}

Topbar.defaultProps = {
  nationList: []
}

module.exports = injectSheet(styles)(Topbar)
