import * as React from 'react';
import './transfer.css'
import {useAuthValue} from './AuthContext'
import {db} from "./firebase";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, runTransaction, addDoc } from "firebase/firestore";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'amountTransacted',
    headerName: 'Amount',
    width: 150,
    editable: false,
  },
  
  {
    field: 'fromEmail',
    headerName: 'From Email',
    width: 200,
    editable: false,
  },
  {
    field: 'fromAccountNumber',
    headerName: 'From',
    width: 200,
    editable: false,
  },

  {
    field: 'toEmail',
    headerName: 'To Email',
    width: 200,
    editable: false,
  },

  {
    field: 'toAccountNumber',
    headerName: 'To',
    width: 200,
    editable: false,
  },
  {
    field: 'date',
    headerName: 'Date',
    type: 'date',
    width: 200,
    editable: false,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 200,
    editable: false,
  }

];






function Transfer() {
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

  // rows data from the transaction collection in the database
  // if fromEmail === currentUser?.email, then the transaction data is displayed in the table
  const docRef = collection(db, 'transactions')
  const [rows, setRows] = useState([])
  const rowsDisplay = rows.filter(row => row.fromEmail === currentUser?.email)
  useEffect(
    () =>
    onSnapshot(docRef, (snapshot) =>
    setRows(snapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
    ),
    )
    // also display rows that row.toEmail === currentUser?.email
    const rowsDisplay2 = rows.filter(row => row.toEmail === currentUser?.email)
    





  return (
          <div className="content">
            <div className='center'>
              <div className='transfer'>
                <Link to='/profile' className='back'> <KeyboardBackspaceIcon sx={{fontSize: "40px"}}/></Link>
                <h1>Transfer</h1>
                {/* submit2 instead of submit3 */}
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

                <div className='transactions'>
                  <h1>Transactions history</h1>
                  <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid sx={{ color: 'white' }}
        rows={[...rowsDisplay, ...rowsDisplay2]}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
      />
    </Box>
                </div>
                </div>
                </div>
  );
}

export default Transfer