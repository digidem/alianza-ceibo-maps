import React from 'react'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'
import classNames from 'classnames'
import { defineMessages, FormattedMessage } from 'react-intl'

import Typography from './Typography'

const messages = defineMessages({
  // Installation count for sidebar subheading
  installationsCount: `{count, plural,
    =0 {0 total installations}
    one {1 total installation}
    other {# total installations}}`,
  // Communities count for sidebar subheading
  communitiesCount: `{count, plural,
    =0 {0 communities}
    one {1 community}
    other {# communities}}`
})

const styles = {
  root: {
    padding: '2em',
    backgroundColor: '#365973',
    color: 'white'
  }
}

const SidebarHeader = ({title, installationsCount, communitiesCount, className, classes}) => {
  return (
    <div className={classNames(classes.root, className)}>
      <Typography gutterBottom type='title'>{title}</Typography>
      {!!installationsCount && <Typography type='subtitle'>
        <FormattedMessage {...messages.installationsCount} values={{count: installationsCount}} />
      </Typography>}
      {!!communitiesCount && <Typography type='subtitle'>
        <FormattedMessage {...messages.communitiesCount} values={{count: communitiesCount}} />
      </Typography>}
    </div>
  )
}

SidebarHeader.propTypes = {
  title: PropTypes.string.isRequired,
  installationsCount: PropTypes.number.isRequired,
  communitiesCount: PropTypes.number,
  className: PropTypes.string,
  classes: PropTypes.object.isRequired
}

module.exports = injectSheet(styles)(SidebarHeader)
