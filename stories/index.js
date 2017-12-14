import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import StoryRouter from 'storybook-router'
import { Route } from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import SidebarCounts from '../components/SidebarCounts'
import SidebarHeader from '../components/SidebarHeader'
import SidebarList from '../components/SidebarList'
import SidebarListItem from '../components/SidebarListItem'
import SidebarStoryItem from '../components/SidebarStoryItem'
import Typography from '../components/Typography'
import Image from '../components/Image'
import Topbar from '../components/Topbar'
import Popup from '../components/Popup'

const sizesDecorator = story => (
  <div>
    <div style={{width: 400, backgroundColor: 'white', overflow: 'auto', marginBottom: 30}}>
      {story()}
    </div>
    <div style={{width: 300, backgroundColor: 'white', overflow: 'auto', marginBottom: 30}}>
      {story()}
    </div>
    <div style={{width: 175, backgroundColor: 'white', overflow: 'auto', marginBottom: 30}}>
      {story()}
    </div>
  </div>
)

const listFixture = [{
  name: 'Bovaroe',
  solar: 4,
  water: 10,
  featured: true,
  image: 'https://placeimg.com/500/500/people',
  color: '#6EA465'
}, {
  name: 'Centro Dureno',
  solar: 14,
  water: 4,
  featured: true,
  image: 'https://placeimg.com/500/500/nature',
  color: '#A8605D'
}, {
  name: 'Centro Upirito Canqque',
  solar: 10,
  water: 40,
  image: 'https://placeimg.com/500/500/animals',
  color: '#CECE6A'
}]

const nationsFixture = [{
  name: 'Kofan',
  color: '#6EA465'
}, {
  name: 'Siekopai',
  color: '#A8605D'
}, {
  name: 'Waorani',
  color: '#CECE6A'
}]

storiesOf('Sidebar', module)
  .addDecorator(sizesDecorator)
  .addDecorator(StoryRouter())
  .add('SidebarCounts', () => (
    <SidebarCounts water={195} solar={9} />
  ))
  .add('SidebarHeader', () => (
    <SidebarHeader title='Where We Work' installationsCount={194} communitiesCount={54} />
  ))
  .add('SidebarList', () => (
    <SidebarList>
      {listFixture.map(item => <SidebarListItem
        {...item}
        baseUrl='/Kofan/Kofan Dureno' />
      )}
    </SidebarList>
  ))
  .add('SidebarStoryList', () => (
    <SidebarList>
      {listFixture.map(item => <SidebarStoryItem
        name='Giving Roots to Resistance'
        image='https://placeimg.com/500/500/animals'
        url='www.amazonfrontlines.org/blog/blog_post' />
      )}
    </SidebarList>
  ))
  .add('Sidebar', () => (
    <div style={{maxHeight: 700, display: 'flex'}}>
      <Sidebar
        title='Where We Work'
        image='https://placeimg.com/500/500/nature'
        water={195}
        solar={54}
        listTitle='Who we work with'
        list={listFixture}
        text={'Lorem ipsum dolor sit amet, **consectetur** adipiscing elit,' +
          'sed do eiusmod tempor incididunt ut labore et dolore magna' +
          'aliqua. Ut enim ad minim veniam, quis nostrud exercitation' +
          'ullamco laboris nisi ut aliquip ex ea commodo consequat.' +
          '\n\n' +
          'Duis aute irure dolor in reprehenderit in voluptate velit' +
          'esse cillum dolore eu fugiat nulla pariatur.'} />
    </div>
  ))

storiesOf('Topbar', module)
  .addDecorator(StoryRouter())
  .add('overview', () => (
    <Topbar nationList={nationsFixture} />
  ))
  .add('nation', () => (
    <Topbar nation='Kofan' nationList={nationsFixture} />
  ))
  .add('area', () => (
    <Topbar nation='Kofan' area='Kofan Dureno' nationList={nationsFixture} />
  ))
  .add('no area', () => (
    <Topbar nation='Kofan' area='_' community='Bavore' nationList={nationsFixture} />
  ))
  .add('community', () => (
    <Topbar nation='Kofan' area='Kofan Dureno' community='Bavore' nationList={nationsFixture} />
  ))
  .add('very long', () => (
    <Topbar nation='Kofan Long' area='Kofan Dureno La La' community='Bavore long name' nationList={nationsFixture} />
  ))

storiesOf('Typography', module)
  .add('default', () => (
    <div>
      <div style={{backgroundColor: 'rgb(53, 89, 115)', padding: 10}}>
        <Typography type='title'>Title</Typography>
        <Typography gutterBottom type='subtitle'>Subtitle</Typography>
      </div>
      <div style={{backgroundColor: 'white', padding: 10}}>
        <Typography gutterBottom type='body'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit
          esse cillum dolore eu fugiat nulla pariatur.
        </Typography>
        <Typography gutterBottom type='sectionTitle'>Section Title</Typography>
        <Typography type='countLabel'>Count Label</Typography>
        <Typography gutterBottom type='count'>1234</Typography>
        <Typography type='listTitle'>List Title</Typography>
        <Typography gutterBottom type='listSubtitle'>List Subtitle</Typography>
      </div>
    </div>
  ))

storiesOf('Image', module)
  .add('3x2', () => (
    <div style={{width: 300}}>
      <Image src='https://placeimg.com/500/500/nature' />
    </div>
  ))
  .add('4x3', () => (
    <div style={{width: 300}}>
      <Image src='https://placeimg.com/500/500/nature' ratio='4x3' />
    </div>
  ))
  .add('16x9', () => (
    <div style={{width: 300}}>
      <Image src='https://placeimg.com/500/500/nature' ratio='16x9' />
    </div>
  ))

storiesOf('Popup', module)
  .add('default', () => (
    <Popup name='Kofan' water={15} solar={9} />
  ))
