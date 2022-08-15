import * as React from 'react';
import './transfer.css'
import {useAuthValue} from './AuthContext'
import {db} from "./firebase";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, runTransaction } from "firebase/firestore";


function Transfertest() {
  // create a transaction to update the amount of the user who is sending the money
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const {currentUser} = useAuthValue()
  const [users, setUsers] = useState([{email: 'Loading...', id: 'Initial'}])
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
        setError('Insufficient funds')
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
        transaction.update(userRef, {amount: newAmount})
        submit(e)
        return newAmount
      }
      )
      transaction.then(() => {
        setError('')
        setAmount('')
        setEmail('')
      }
      ).catch(() => {
        setError('Insufficient funds'  && <p style={{color: "red"}}>Insufficient funds</p>)
      }
      )
    }
    else {
      setError('User not found' && <p style={{color: "red"}}>User not found</p>)
    }


  }

  
  return (
          <div>
            <div className='center'>
              <div className='transfer'>
                <h1>Transfer</h1>
                <form onSubmit={submit2}>
                  <label>
                    Email:
                    <input type="email" 
                    placeholder="Enter receiver's email"
                    required  
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} />
                  </label>
                  <label>
                    Account number:
                    <input type="text"
                    placeholder="Enter account number"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)} />
                  </label>
                  <label>
                    Amount:
                    <input type="text"
                    placeholder='Enter amount KSH'
                    required value={amount}  
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
                  </label>
                  <input type="submit" value="Submit" />
                </form>
                <h1>{error}</h1>
                </div>
                </div>
    </div>
  );
}

export default Transfertest