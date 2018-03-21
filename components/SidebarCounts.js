import React from 'react'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'
import {defineMessages, FormattedMessage} from 'react-intl'

import Typography from './Typography'

const messages = defineMessages({
  // Label for count of water installations
  water: 'Water',
  // Label for count of solar installations
  solar: 'Solar',
  // Label for count of coming soon water installations,
  waterRequired: 'Underway in 2018'
})

const styles = {
  outer: {
    overflow: 'hidden'
  },
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '-0.25rem -0.5rem',
    flexWrap: 'wrap'
  },
  icon: {
    height: '1.875rem'
  },
  count: {
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    '& > *': {
      padding: '0.25rem 0.5rem'
    }
  },
  divider: {
    borderRight: '1px solid #E3E3E3'
  },
  countLabel: {
    flex: 1,
    minWidth: 0
  },
  measure: {
    position: 'absolute',
    padding: 0,
    margin: 0,
    width: 0,
    height: 0,
    overflow: 'hidden',
    '& > div': {
      display: 'inline-block'
    }
  }
}

class Count extends React.Component {
  state = {
    count: 0,
    minWidth: 0
  }

  componentDidMount () {
    this.tick()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.total === this.props.total) return
    this.setState({count: 0}, this.tick)
  }

  componentWillUnmount () {
    clearTimeout(this.timeoutID)
  }

  tick = () => {
    const {total} = this.props
    const step = 3000 / total // always take 3 seconds to complete count
    if (this.state.count === total) return
    if (this.state.count > total) return this.setState({count: total})
    this.setState(
      prevState => ({count: prevState.count + 1}),
      () => (this.timeoutID = setTimeout(this.tick, step))
    )
  }

  // Measure the final width of the count, to stop the layout jumping too
  // much as the count increases.
  // TODO: Still jumps for numbers that are wider than the final amount e.g.
  // total is 211, but 199 will render wider
  measure = (el) => {
    if (!el) return
    this.setState({minWidth: Math.ceil(el.getBoundingClientRect().width + 1)})
  }

  render () {
    const {name, icon, classes, total} = this.props
    const {count, minWidth} = this.state
    return (
      <div className={classes.count}>
        <img src={icon} className={classes.icon} />
        <Typography type='countLabel' className={classes.countLabel} noWrap>{name}</Typography>
        <Typography type='count' style={{minWidth: minWidth}}>{count}</Typography>
        <div className={classes.measure}>
          <div ref={this.measure}>
            <Typography type='count'>{total}</Typography>
          </div>
        </div>
      </div>
    )
  }
}

Count.propTypes = {
  total: PropTypes.number.isRequired,
  name: PropTypes.node.isRequired,
  icon: PropTypes.string.isRequired
}

const SidebarCounts = ({water, waterRequired, solar, classes, show}) => (
  <div className={classes.outer}>
    <div className={classes.root}>
      {show !== 'solar' && water && <Count
        icon='/icons/water.svg'
        total={water}
        name={<FormattedMessage {...messages.water} />}
        classes={classes} />
      }
      {show !== 'solar' && waterRequired > 0 && <Count
        icon='/icons/agua-requerido.svg'
        total={waterRequired}
        name={<FormattedMessage {...messages.waterRequired} />}
        classes={classes} />}
      {!show && <div className={classes.divider} />}
      {show !== 'agua' && solar && <Count
        icon='/icons/solar.svg'
        total={solar}
        name={<FormattedMessage {...messages.solar} />}
        classes={classes} /> }
    </div>
  </div>
)

SidebarCounts.propTypes = {
  water: PropTypes.number,
  solar: PropTypes.number,
  waterRequired: PropTypes.number
}

SidebarCounts.defaultProps = {
  water: 0,
  solar: 0,
  waterRequired: 0
}

module.exports = injectSheet(styles)(SidebarCounts)
