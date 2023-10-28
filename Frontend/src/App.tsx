import React from 'react'
import Form from './page/form'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Online from './page/online'
import Offline from './page/offline'
import { Navigate } from 'react-router-dom'

function App(): React.JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path='' element={<Form />} />
        <Route path='/online/*'>
          <Route path=':room' element={<Online />} />
          <Route path='*' element={<NavigateToForm />} />
        </Route>
        <Route path='/offline' element={<Offline />} />
      </Routes>
    </Router>
  )
}

const NavigateToForm = (): React.JSX.Element => {
  return <Navigate to='/' />
}

export default App
