import {useState, useMemo } from 'react'
import './forms.css'
import {auth} from './firebase'
import {useNavigate, Link} from 'react-router-dom'
import {createUserWithEmailAndPassword, sendEmailVerification} from 'firebase/auth'
import {useAuthValue} from './AuthContext'
import { collection, addDoc } from "firebase/firestore";
import {db} from "./firebase";
import Select from 'react-select'
import countryList from 'react-select-country-list'



function Register() {
  const [value, setValue] = useState('')
  const options = useMemo(() => countryList().getData(), [])

  const changeHandler = value => {
    setValue(value)
  }

  

  // create a random accountNumber with 11 digits and check if it already exists in the database
  // if it does, generate a new one
  function generateAccountNumber() {
    let accountNumber = Math.floor(Math.random() * 1000000000000);
    let accountNumberString = accountNumber.toString();
    let accountNumberLength = accountNumberString.length;
    let accountNumberArraySum = 0;
    if (accountNumberLength === 11 && accountNumberArraySum % 11 === 0) {
      return accountNumber;
    } else {
      return generateAccountNumber();
    }
  }

  const [fullName, setfullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [idNumber, setidNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const {setTimeActive} = useAuthValue()
  const submit = (e) => {
    e.preventDefault();
    addDoc(collection(db, "users" ), {
      email: email,
      amount: 0,
      accountNumber: generateAccountNumber(),
      fullName: fullName,
      phone: phone,
      idNumber: idNumber,
      country: value.label,
    });
    console.log("details added");
  };

  
  const validatePassword = () => {
    let isValid = true
    if (password !== '' && confirmPassword !== ''){
      if (password !== confirmPassword) {
        isValid = false
        setError('Passwords does not match')
      }
    }
    return isValid
  }

  const register = e => {
    e.preventDefault()
    setError('')
    if(validatePassword()) {
        createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          sendEmailVerification(auth.currentUser)   
          .then(() => {
            setTimeActive(true)
             // black background for the ./verify-email page
             navigate('/verify-email', {state: {backgroundColor: 'black', color: 'white'}})
          }).catch((err) => alert(err.message))
          submit(e)
        })
        .catch(err => {
          switch(err.code){
            case 'auth/email-already-in-use':
              setError('Email already in use')
              break
            case 'auth/invalid-email':
              setError('Invalid email')
              break
            case 'auth/weak-password':
              setError('Password must be at least 6 characters')
              break
            default:
              setError('Something went wrong')
          }
        })
    }
    setEmail('')
    setPassword('')
    setConfirmPassword('')

  }

  return (
    <div className='center'>
      <div className='auth'>
        <h1>Register</h1><br />
        {error && <div className='auth__error'>{error}</div>}
        <form onSubmit={register} name='registration_form'>
          <input
          type='text'
          value={fullName}
          placeholder="Enter full name"
          required
          onChange={e => setfullName(e.target.value)}/>

          <input 
            type='email' 
            value={email}
            placeholder="Enter your email"
            required
            onChange={e => setEmail(e.target.value)}/>

          <input
          type='text'
          value={phone}
          placeholder="Enter phone number"
          required
          onChange={e => setPhone(e.target.value)}/> 

          <input 
          type='text'
          value= {idNumber}
          placeholder= "Enter ID or passport number"
          required
          onChange={e => setidNumber(e.target.value)}/> 

          <Select options={options} value={value} onChange={changeHandler}
          placeholder="Select country"
          styles={{
            control: (base, state) => ({
              ...base,
              border: state.isFocused ? 0 : 0,
              boxShadow: state.isFocused ? 0 : 0,
              '&:hover': {
                border: state.isFocused ? 0 : 0
              }
            }),
            option: (styles, { data, isDisabled, isFocused, isSelected }) => {
              return {
                ...styles,
                backgroundColor: isSelected ? '#0f4c75' : isFocused ? '#0f4c75' : null,
                color: isSelected ? '#fff' : isFocused ? '#fff' : null,
              };
            },
            singleValue: (styles, { data }) => ({ ...styles, color: '#0f4c75' }),
            multiValueRemove: (styles, { data }) => ({ ...styles, color: '#0f4c75' }),
            menu: (styles) => ({ ...styles, backgroundColor: '#000' }),


          
          }}
          
          />
          

          <input 
            type='password'
            value={password} 
            required
            placeholder='Enter your password'
            onChange={e => setPassword(e.target.value)}/>

            <input 
            type='password'
            value={confirmPassword} 
            required
            placeholder='Confirm password'
            onChange={e => setConfirmPassword(e.target.value)}/>

          <button type='submit'>Register</button>
        </form>
        <span>
          Already have an account? {' '} 
          <Link to='/login'>login</Link>
        </span>
      </div>
    </div>
  )
}

export default Register;