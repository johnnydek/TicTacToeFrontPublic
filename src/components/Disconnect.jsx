import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Comp.css'

export default function Disconnect(props) {
    const nav= useNavigate()

   if(props.outcome === null){
    return (
        <div className='errorClass'>
            <h1>ERROR</h1>
            <button style={{color:'white', backgroundColor:'rgba(170, 170, 87)', width:'180px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{nav('/main')}}>Back To Main Menu</button>
            </div>
      )
   }
   if(props.outcome !== null){
  return (
    <div className='errorClass'>
        <h1>We're Sorry! But your opponent has disconnected!</h1>
        {props.outcome === props.playerName && <h2>You were in the lead though!</h2>}
        <button style={{color:'white', backgroundColor:'rgba(170, 170, 87)', width:'180px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{nav('/main')}}>Back To Main Menu</button>
        </div>
  )
   }
}
