import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Log = React.lazy(() => import('./views/theme/logs/logs'))
const Track = React.lazy(() => import('./views/theme/track/Track.js'))
const Token = React.lazy(() => import('./views/theme/tokens/tokens'))
const Maps = React.lazy(() => import('./views/theme/maps/Maps.js'))
const TrackToken = React.lazy(() => import('./views/theme/tracktoken/TrackToken.js'))
const Category = React.lazy(() => import('./views/theme/category/Category.js'))
const Stats = React.lazy(() => import('./views/theme/stats/Stats.js'))



// Add this to your imports


const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/utils', name: 'Utils', element: Token, exact: true },
  { path: '/utils/tokens', name: 'Tokens', element: Token },
  { path: '/utils/track', name: 'Track', element: Track },
  { path: '/utils/track/:token', name: 'TrackToken', element: TrackToken },
  { path: '/utils/track/stats/:token', name: 'Stats', element: Stats },
  { path: '/utils/logs', name: 'Logs', element: Log },
  { path: '/utils/maps', name: 'Maps', element: Maps },
  { path: '/utils/category', name: 'Category', element: Category },
]

export default routes
