import React from 'react'
import "./homecontent.css"
import pic1 from "./pic1.jpeg"
import pic2 from "./pic2.jpeg"
import pic3 from "./pic3.jpeg"

export default function Homecontent() {
  return (
    <div className= "homecontent">
        <h1>When you and your customers need it most</h1>
        <p>Global efforts to stop the spread of COVID-19 have changed the world—and the way you do business—overnight. We're here to help your business deliver when you and your customers need it most. </p><br/>
        <div className="wrapper">
        <div className="card">
          <img src={pic1} alt="pic1" />
          <h1>Banking is changing for the better</h1><br/>
          <p>Receive your funds electronically via Trans National Banking Online and never receive a paper version again!</p>
        </div>
        <div className="card">
          <img src={pic2} alt="pic1" />
          <h1>Open a Trans National Bank account</h1><br/>
          <p>Benefit from our services and solutions designed to meet all of your banking needs. Sign up for a TCD bank account now. </p>
        </div>
        <div className="card">
          <img src={pic3} alt="pic1" />
          <h1>Trans National Priority Banking</h1><br/>
          <p>More delivery time options are available for your international shipments from January 3, 2022.</p>
        </div>
        </div>
    </div>
  )
}
