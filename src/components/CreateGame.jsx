import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Comp.css'

export default function CreateGame(props) {
  const nav = useNavigate()
  
  const createGameOnServer =async (name,creator,color) =>{

    if(name.length < 2 || name.length > 10){
      let error = document.getElementById('errorMes')

      error.textContent = 'Name must be between 2 to 10 characters long'
      return
    }

  props.socket.emit('createGame',
  {
    "gameName": name,
    "userName": creator,
    "media": null,
    "gameColor": color,
    "status": 'open',
  })

  }

  useEffect(() => {

  props.socket.on('message',(data)=>{
    const message = JSON.parse(data)
    console.log('message is:',message)
    if(message.msg === 'createGameSuccess'){
      props.shareGame({"name":document.getElementById('name').value,'id':message.id});
      nav('/preGame');
    }else if(message.msg === 'createGameError'){
      console.log('ERROR:', message.error);
    }

    return ()=>{
      props.socket.off('message')
      // props.socket.emit('close')
    }
    
  })

}, [props.socket]);


  return (
    <div className='CompApp' id='container' style={{'backgroundColor':'white','height':'370px', 'borderRadius':'5%', 'border':'solid', 'borderColor':'rgba(170, 170, 87)'}}>
      <h2 style={{fontWeight:'bold'}}>Game Name</h2>
      <br/>
      <input id="name" type = 'text'placeholder='Input Game Name'/>
      <p id="errorMes" style={{fontWeight:'bold','color':'red'}}></p>
      <h2 style={{fontWeight:'bold'}}>Pick a Color</h2>
      <br/>
      <input id='gameColor' style={{width:'292px', marginLeft:'5px'}} type ='color'/>
      <br/>
      <br/>
      <button style={{backgroundColor:'beige', width:'150px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{createGameOnServer(document.getElementById('name').value,props.creator,document.getElementById('gameColor').value)}}>CREATE</button>
      <br/>
      <br/>
      <button style={{backgroundColor:'beige', width:'150px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{props.closeMenu(false)}}>CANCEL</button>
    </div>
  )
}
