import React from 'react'
import injectSheet from 'react-jss'
import { Link } from 'react-router-dom'
import { defineMessages, FormattedMessage } from 'react-intl'
import Typography from './Typography'

const messages = defineMessages({
  text: 'Support our Work',
  linkText: 'Donate'
})

var styles = {
  root: {
    'height': '30px',
    'position': 'fixed',
    'bottom': '0',
    'width': '100%',
    'background-color': 'rgba(51,51,51,.8)',
    'color': 'white',
    'text-align': 'center'
  }
}

class Donatebutton extends React.Component {
  render () {
    const {classes} = this.props
    return <div className={classes.root}>
      <Typography type='sectionTitle'>
        <FormattedMessage {...messages.text} />
        <Link to='https://www.amazonfrontlines.org/donate/'>
          <FormattedMessage {...messages.linkText} />
        </Link>
      </Typography>
    </div>
  }
}

module.exports = injectSheet(styles)(Donatebutton)
