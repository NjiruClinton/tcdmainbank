import './App.css';
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Profile from './Profile'
import Register from './Register'
import VerifyEmail from './VerifyEmail';
import Login from './Login'
import {useState, useEffect} from 'react'
import {AuthProvider} from './AuthContext'
import {auth} from './firebase'
import {onAuthStateChanged} from 'firebase/auth'
import PrivateRoute from './PrivateRoute'
import {Navigate} from 'react-router-dom'
import Home from './Components/Home';
import Transfer from './Transfer';
import Admin from './Components/Admin';
import Adminmain from './Components/Adminmain';
import Favicon from 'react-favicon'
import fav1 from './favicon_io/FAV1.png'
import fav2 from './favicon_io/FAV2.png'
import fav3 from './favicon_io/FAV3.png'
import fav4 from './favicon_io/FAV4.png'
import fav5 from './favicon_io/FAV5.png'

function App() {

  const [currentUser, setCurrentUser] = useState(null)
  const [timeActive, setTimeActive] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })
  }, [])

  return (
    <Router>
      <Favicon url={[fav1, fav2, fav3, fav4, fav5]} />
      <AuthProvider value={{currentUser, timeActive, setTimeActive}}>
        <Routes>
          <Route exact path='/profile' element={
            <PrivateRoute>
              <Profile/>
            </PrivateRoute>
          }/>
          <Route path="/login" element={
            !currentUser?.emailVerified 
            ? <Login/>
            : <Navigate to='/profile' replace/>
          } />
          <Route path="/register" element={
            !currentUser?.emailVerified 
            ? <Register/>
            : <Navigate to='/profile' replace/>
          } />
          <Route path='/verify-email' element={<VerifyEmail/>} /> 
          <Route path='/transfer' element={<Transfer/>} />
        <Route path='/' element={<Home/>} />
        <Route path='/admin' element={<Admin/>} />
        <Route path="/adminmain" element={<Adminmain/>} />
        </Routes>
      </AuthProvider>
  </Router>
  );
}

export default App;