import React from 'react'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'
import Markdown from 'react-markdown'
import classNames from 'classnames'
import Typography from './Typography'
import SidebarHeader from './SidebarHeader'
import SidebarCounts from './SidebarCounts'
import SidebarList from './SidebarList'
import SidebarListItem from './SidebarListItem'
import SidebarStoryItem from './SidebarStoryItem'
import Image from './Image'

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    overflowY: 'scroll',
    borderRight: '1px solid #E3E3E3',
    height: '100%'
  },
  padding: {
    padding: '2em'
  },
  sectionTitle: {
    padding: '0.625em 2em',
    borderTop: '1px solid #E3E3E3',
    borderBottom: '1px solid #E3E3E3'
  }
}

const t = {
  en: {
    installations: 'Installations'
  },
  es: {
    installations: 'Instalaciones'
  }
}

class Sidebar extends React.Component {
  componentWillReceiveProps ({title, image, solar, water, text}) {
    const propsUnchanged = title === this.props.title &&
      image === this.props.image &&
      solar === this.props.solar &&
      water === this.props.water &&
      text === this.props.text
    if (propsUnchanged || !this.scrollContent) return
    this.scrollContent.scrollTop = 0
  }

  render () {
    const {
      image,
      title,
      solar,
      water,
      text,
      listTitle,
      list,
      className: classNameProp,
      classes,
      stories,
      onHover
    } = this.props

    const className = classNames(classNameProp, classes.root)

    return <div className={className}>
      <SidebarHeader title={title} installationsCount={solar + water} />
      <div className={classes.content} ref={el => (this.scrollContent = el)}>
        {image && <Image src={image} ratio='4x3' />}
        {text && <div className={classes.padding}>
          <Markdown source={text} parserOptions={{smart: true}} renderers={{
            paragraph: props => <Typography gutterBottom type='body'>{props.children}</Typography>
          }} />
        </div>}
        {!!(solar + water) && <div className={classes.sectionTitle}>
          <Typography type='sectionTitle'>{gett(t).installations}</Typography>
        </div>}
        {!!(solar + water) && <div className={classes.padding}>
          <SidebarCounts water={water} solar={solar} />
        </div>}
        {listTitle && list && !!list.length && <div className={classes.sectionTitle}>
          <Typography type='sectionTitle'>{listTitle}</Typography>
        </div>}
        {list && <SidebarList>
          {list.map(item => stories
            ? <SidebarStoryItem key={item.name} {...item} />
            : <SidebarListItem key={item.name} {...item} onHover={onHover} />
          )}
        </SidebarList>}
      </div>
    </div>
  }
}

Sidebar.propTypes = {
  /* Sidebar title */
  title: PropTypes.string,
  /* Total number of solar installations for this sidebar context */
  solar: PropTypes.number.isRequired,
  /* Total number of water installations for this sidebar context */
  water: PropTypes.number.isRequired,
  /* URL to image to show at top of sidebar */
  image: PropTypes.string,
  /* Sidebar body text */
  text: PropTypes.string,
  /* Title for list of places in this context */
  listTitle: PropTypes.string,
  /* List of places to show */
  list: PropTypes.array,
  /* Called when an item is hovered with the id of the item */
  onHover: PropTypes.func.isRequired,
  className: PropTypes.string,
  classes: PropTypes.object.isRequired,
  stories: PropTypes.bool
}

Sidebar.defaultProps = {
  title: 'Loading…',
  solar: 0,
  water: 0,
  stories: false
}

module.exports = injectSheet(styles)(Sidebar)
