import React, { Suspense } from 'react'
import { BrowserRouter as Router, Switch, Route, Link, useRouteMatch } from 'react-router-dom'
import { lazy } from 'react'

let Routes = [
  {
    path: '/',
    component: lazy(() => import('./Pages/Game.js'))
  },
  {
    path: '/p2/:name',
    component: lazy(() => import('./Pages/Basic.js'))
  }
]

export default function App () {
  return (
    <Router>
      <Suspense fallback={null}>
        <PageRoutes></PageRoutes>
      </Suspense>

      <div className=" select-none touch-action-manipulation absolute top-0 left-0">
        <Link to="/">Home</Link>
        <Link to="/p2/waha">waha</Link>
      </div>
    </Router>
  )
}

export const PageRoutes = () => {
  let routeInfo = useRouteMatch('/p2/:name')
  return <Switch>
    {Routes.map((route, i) => {
      return <Route key={`route-${i}`} exact path={route.path} render={() => {
        let Page = route.component
        return <Page route={routeInfo}></Page>
      }} />
    })}
  </Switch>
}