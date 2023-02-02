import './profile.css'
import React from 'react'
import {useAuthValue} from './AuthContext'
import { signOut } from 'firebase/auth' 
import { auth } from './firebase'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import {db} from "./firebase";
import { collection, onSnapshot, doc, runTransaction, addDoc } from "firebase/firestore";
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import { Link } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout';




function Profile(props) {
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
        OK
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const [open1, setOpen1] = React.useState(false);
  const handleClick1 = () => {
    setOpen1(true);
  };

  const handleClose1 = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen1(false);
  };

  const action1 = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose1}>
        OK
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose1}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );
  

 
  // const transfersOnHold = (email) => {
  //   // alert "transfers for email are on hold"
  //   handleClick2()
  // }

  
  
  const {currentUser} = useAuthValue()
  const [users, setUsers] = useState([{email: 'Loading...', id: 'Initial'}])
  useEffect(
    () => 
    onSnapshot(collection(db, 'users'), (snapshot) => 
    setUsers(snapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
    ),
   [])
   

    useEffect(() => {
      document.body.style.height = '100%'
      document.body.style.overflow = 'hidden'
    }, [])

    const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  useEffect(
    () =>
    onSnapshot(collection(db, 'users'), (snapshot) =>
    setUsers(snapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
    ),
    [])
       
   
  const submit = async (e) => {
    e.preventDefault();
    const user = users.find(user => user.email === email)
    console.log(user)
    if (user) {
      const transaction = runTransaction(db, async (transaction) => {
        const userRef = doc(db, `users/${user.id}`)
        console.log(userRef)
        const userSnapshot = await transaction.get(userRef)
        console.log(userSnapshot)
        const newAmount = parseInt(userSnapshot.data().amount) + parseInt(amount) 
        console.log(newAmount)
        transaction.update(userRef, {amount: newAmount})
        return newAmount
      }

      )
      transaction.then(() => {
        setError('')
        setAmount('')
        setEmail('')
      }
      ).catch(() => {
        setError('Check credentials' && <p style={{color: "red"}}>Check credentials</p>)
      }
      )
    }
    else {
      setError('User not found')
    }

  }

  

  // subtract the amount sent from currentUser's amount and update the database
  const submit2 = async (e) => {
    e.preventDefault();
    const user = users.find(user => user.email === currentUser?.email)
    console.log(user)
    
    if (user) {
      const transaction = runTransaction(db, async (transaction) => {
        const userRef = doc(db, `users/${user.id}`)
        console.log(userRef)
        const userSnapshot = await transaction.get(userRef)
        console.log(userSnapshot)
        const newAmount = parseInt(userSnapshot.data().amount) - parseInt(amount)
        console.log(newAmount)
        // if the amount is less than 0, then the transaction is not executed
        // error to be in red
        if(newAmount < 0) {
          setError('Insufficient funds'  && <p style={{color: "red"}}>Insufficient funds!</p>)
          return
        }
        // if receivers email is not found, then the transaction is not executed
        const receiver = users.find(user => user.email === email)
        if(!receiver) {
          setError('User not found' && <p style={{color: "red"}}>User not found!</p>)
          return
        }
        // if receiver is also the current user, then the transaction is not executed
        if(receiver.id === user.id) {
          setError('Cannot send to yourself'  && <p style={{color: "red"}}>Cannot send to yourself</p>)
          return
        }
        // if the accountNumber entered by the user is not found in the database, then the transaction is not executed
        const accountNumberEntered = accountNumber
        const receiverAccountNumber = receiver.accountNumber
        if(!accountNumberEntered.includes(receiverAccountNumber)) {
          setError('Account number not found or does not match' && <p style={{color: "red"}}>Account number not found or does not match!</p>)
          return
        }

        transaction.update(userRef, {amount: newAmount})
        submit(e)
        addDoc(collection(db, "transactions" ), {
          amountTransacted: amount,
          fromAccountNumber: users.find(user => user.email === currentUser?.email)?.accountNumber,
          toAccountNumber: accountNumber,
          fromEmail: currentUser?.email,
          toEmail: email,
          // date and time
          date: new Date().toLocaleString(),
          status: "transaction on hold"
        });
        return newAmount
      }
      )
      transaction.then(() => {
        setError('')
        setAmount('')
        setEmail('')
      }
      ).catch(() => {
        setError('Check credentials'  && <p style={{color: "red"}}>Check credentials!</p>)
      }
      )
    }
    else {
      setError('User not found' && <p style={{color: "red"}}>User not found</p>)
    }

  }

  const docRef = collection(db, 'transactions')
  const [ setRows] = useState([])
  useEffect(
    () =>
    onSnapshot(docRef, (snapshot) =>
    setRows(snapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
    ),
    )
    



  return (
   
       <div className= "body1">
         <input type="checkbox" id="drawer-toggle" name="drawer-toggle"/>
   <label for="drawer-toggle" id="drawer-toggle-label"></label>
   <header style={{backgroundColor: "#d4cfcf"}}>Dashboard</header>
   <nav id="drawer">
      <ul>
      <div className='dash-buttons'>
            <Link to="/transfer">
        <Button variant="text"  style={{color: "white"}} > Transfer</Button></Link>
        
      </div>
        <div className='dash-buttons'>
          <Link to="/profile">
        <Button onClick={handleClick} style={{color: "white"}}>Deposit</Button></Link>
        <Snackbar
          open={open}
          autoHideDuration={600}
          onClose={handleClose}
          message="Cannot deposit at this time"
          action={action}
        />
      </div>
        <div className='dash-buttons'>
          <Link to="/profile">
        <Button onClick={handleClick1} style={{color: "white"}}>Messages</Button></Link>
        <Snackbar
          open={open1}
          autoHideDuration={600}
          onClose={handleClose1}
          message="Cannot see messages at this time"
          action={action1}
        />
      </div>
      </ul>
   </nav>
   <div id="page-content">

<div className="name-balance">
<div className='signout'>
                 <span onClick={() => signOut(auth)}><LogoutIcon/></span> 
               </div>
<div className='balance'>
      <p>${users.find(user => user.email === currentUser?.email)?.amount}</p>
    </div>
    <div className='name'>
      <p>{users.find(user => user.email === currentUser?.email)?.fullName}</p>
    </div>
    
</div>

    <div className='otherinfo'>
      <p><strong>Email: </strong>{currentUser?.email}</p>
      <p><strong>account number: </strong>{users.find(user => user.email === currentUser?.email)?.accountNumber}</p>
      <p>
        <strong>Email verified: </strong>
        {`${currentUser?.emailVerified}`}
      </p>

    </div>

               
<div className='transfer1'>
                <h1>Transfer</h1>
                <form onSubmit={submit2}>
                  <label>
                    <input type="email" 
                    placeholder="Enter receiver's email"
                    required  
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} />
                  </label>
                  <label>
                    <input type="text"
                    placeholder="Enter account number"
                    required
                    value={accountNumber}
                    maxLength="11"
                    minLength="11"
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} />
                  </label>
                  <label>
                    <input type="text"
                    placeholder='Enter amount KSH'
                    required 
                    value={amount}  
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
                  </label>
                  <input type="submit" value="Submit" />
                </form>
                <h1>{error}</h1>
                </div>

                
</div>

      </div>
  )
}

Profile.propTypes = {
  window: PropTypes.func,
};

export default Profile