import {useState} from 'react'
import { Link } from 'react-router-dom'
import './forms.css'
import {signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail} from 'firebase/auth'
import {auth} from './firebase'
import {useNavigate} from 'react-router-dom'
import {useAuthValue} from './AuthContext'


function Login(){

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') 
  const [error, setError] = useState('')
  const {setTimeActive} = useAuthValue()
  const navigate = useNavigate()

  const login = e => {
    e.preventDefault()
    signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // if the email is not maingrainarticles@gmail.com, dont log in
      if(!auth.currentUser.emailVerified) {
        sendEmailVerification(auth.currentUser)
        .then(() => {
          setTimeActive(true)
          navigate('/verify-email')
        })
      .catch(err => alert(err.message))
    }// if user doesnt exist, dont log in and send error message
    else if(!auth.currentUser.email) {
      setError('User does not exist')
    }
    else{
      navigate('/profile')
    }
    })
    .catch(err => {
      switch(err.code){
        case 'auth/invalid-email':
          setError('Invalid email')
          break
        case 'auth/user-disabled':
          setError('User disabled')
          break
        case 'auth/user-not-found':
          setEmail('')
          setPassword('')
          setError("Invalid Email or Password")
          break
        case 'auth/wrong-password':
          setPassword('')
          setError("Invalid Email or Password")
          break
        default:
          setError('Something went wrong')
      }
    })
  }
  const resetPassword = e => {
    e.preventDefault()
    sendPasswordResetEmail(auth, email)
    .then(() => setError('Password reset email sent to ' + email))
    .catch(err => setError(err.message))
  }


  return(
    <div className='center'>
      
      <div className='auth'>
        <h1>Log in</h1><br />
        {error && <div className='auth__error'>{error}</div>}
        <form onSubmit={login} name='login_form'>
          <input 
            type='email' 
            value={email}
            required
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}/>

          <input 
            type='password'
            value={password}
            required
            placeholder='Password'
            onChange={e => setPassword(e.target.value)}/>

          <button type='submit'>LOG IN</button>
        </form>
        <button onClick={resetPassword} className="forgotp">Forgot password?</button>
        <p>
          Don't have an account?{' '}
          <Link to='/register'>Create one here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login