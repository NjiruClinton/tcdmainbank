import React from 'react'
import { useAuthValue } from '../AuthContext'
import { useEffect, useState } from 'react'
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";


export default function Adminmain() {
    const [users, setUsers] = useState([{email: 'Loading...', id: 'Initial'}])
    useEffect(
        () => 
        onSnapshot(collection(db, 'users'), (snapshot) => 
        setUsers(snapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
        ),
       [])

    const {currentUser} = useAuthValue()
    if(currentUser?.email !== "maingrainarticles@gmail.com") {
        return (
            <div style={{ marginTop: "10%", textAlign: "center"}}>
                <img src='./attention.png' alt='sad' style={{maxHeight: "200px"}}/> <span style={{fontSize: "50px"}}>403 Forbidden</span>
                <h1 style={{}}>Access to this file is Unauthorized</h1>
            </div>
          )
    }
    else{
        return(
            <div>
                <div className='adminheader'>
                <h1>Admin</h1>
                  <p><strong>Email: </strong>{currentUser?.email}</p>
                  <h1>Users</h1>
                        <p><strong>List of users in the databse: </strong></p>
                        <ul>{
                            users.map(user => <li key={user.id}>{user.email}</li>)
                        }</ul>
                </div>
               

        
            </div>
        )
    }


  
}
