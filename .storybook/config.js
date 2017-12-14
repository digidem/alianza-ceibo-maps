import { configure, addDecorator } from '@storybook/react'

import './storybook.css'

function loadStories () {
  require('../stories')
}

configure(loadStories, module)
