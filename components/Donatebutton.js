import React from 'react'
import injectSheet from 'react-jss'
import { Link } from 'react-router-dom'
import { defineMessages, FormattedMessage } from 'react-intl'
import Typography from './Typography'

const messages = defineMessages({
  text: 'Support our Work - Donate'
})

var styles = {
  root: {
    'height': '30px',
    'position': 'fixed',
    'bottom': '0',
    'width': '100%',
    'text-align': 'center',
    'z-index': 999,
    'background-color': 'white',
    textDecoration: 'none',
    'border-color': '#be9926',
    'border-top': '1px solid',
    '&:hover': {
      textDecoration: 'none',
      cursor: 'pointer',
      'background-color': '#be9926'
    }
  },
  text: {
    'color': '#be9926',
    'line-height': '30px',
    '&:hover': {
      color: 'white'
    }
  }
}

class Donatebutton extends React.Component {
  render () {
    const {classes} = this.props
    return <Link className={classes.root} to='https://www.amazonfrontlines.org/donate/' target='_blank'>
      <Typography className={classes.text} type='sectionTitle'>
        <FormattedMessage {...messages.text} />
      </Typography>
    </Link>
  }
}

module.exports = injectSheet(styles)(Donatebutton)
