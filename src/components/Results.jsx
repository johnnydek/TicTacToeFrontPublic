import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Comp.css'


export default function Results(props) {
    const nav = useNavigate()

    if(props.results === null){
      return(
        <div className='errorClass'>
        <h1>ERROR</h1>
        <br/>
        <button style={{color:'white', backgroundColor:'rgba(170, 170, 87)', width:'180px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{nav('/main')}}>Back To Main Menu</button>
        </div>
      )
    }
    if(props.results !== null){
    return (
    <div className='errorClass'>
         <h1>{props.results === 'tie'? `GAME ENDED WITH A TIE`:`${props.results} WINS THE GAME`}</h1>
         <br/>
         <button style={{color:'white', backgroundColor:'rgba(170, 170, 87)', width:'100px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{nav('/main')}}>Back To Main Menu</button>
    </div>
    )
    }
}
