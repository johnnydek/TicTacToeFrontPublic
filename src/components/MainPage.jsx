import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useContext } from 'react'
import { useCallback } from 'react'
import CreateGame from './CreateGame.jsx'
import GameList from './GameList.jsx'
import { SocketContext } from '../socket.js'
import './Comp.css'
import X from '../photo/x-symbol.png'
import O from '../photo/dry-clean.png'
import Star from '../photo/star.png'
import 'bootstrap/dist/css/bootstrap.min.css';



export default function MainPage(props) {
  const [newGameMenu,setNewGameMenu] =useState(0)
  const nav = useNavigate()

  const socket = useContext(SocketContext)



  useEffect(() => {

    socket.on('message',(data)=>{
      const message = JSON.parse(data)
      console.log('message is:',message)
      if(message.msg === 'createGameSuccess'){
        props.setGame({"name":'test','id':'g_EGIK52SMkpGWIPsgc5fac3'});
        nav('/preGame');
      }else if(message.msg === 'createGameError'){
        console.log('ERROR:', message.error);
      }
      
    })
    return ()=>{
      socket.off('message')
      // socket.emit('close')
    }
  }, [socket]);

  const logOut = ()=>{
    sessionStorage.removeItem('userData'); 
    nav('/')
  }


  if(props.user.username !== undefined){
  return (
    <div className='CompApp' style={{ height:'350px'}}>
        <div className='col-12'>
        <h1>Welcome to the home page {props.user.username}!</h1>
        </div>
        <br/>
        <div>
        {newGameMenu == 0 && <img src={X} alt='x' className='menu-symbol'/>}
        {newGameMenu == 0 && <button style={{fontWeight:'bold', fontSize:'large', color:'white', backgroundColor:'rgba(170, 170, 87)', width:'200px', height:'50px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{setNewGameMenu(2)}}>Join a Game</button>}
        {newGameMenu == 0 && <img src={Star} alt='star' className='menu-symbol'/>}
        </div>
        <br/>
        <div>
        {newGameMenu == false && <img src={Star} alt='star' className='menu-symbol'/>}
        {newGameMenu == false && <button style={{fontWeight:'bold', fontSize:'large', color:'white', backgroundColor:'rgba(170, 170, 87)', width:'200px', height:'50px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{setNewGameMenu(1)}}>Host Game</button>}
        {newGameMenu == false && <img src={O} alt='o' className='menu-symbol'/>}
        </div>
        <br/>
        {newGameMenu == 1 && <CreateGame creator = {props.user.username} closeMenu = {setNewGameMenu} shareGame={props.setGame} socket={socket}/>}
        {newGameMenu == 2 && <GameList closeMenu = {setNewGameMenu} socket={socket} turn ={props.playerTurn} role = {props.setRole} symbolSet ={props.setSymbol} gameSet={props.setGame}/>}
        {newGameMenu == 0 && <button style={{fontWeight:'bold', fontSize:'large', color:'white', backgroundColor:'rgba(170, 170, 87)', width:'200px', height:'50px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{logOut()}}>Sign Out</button>}
        <br/>
        <br/>
        <p>Game by Jonathan Dekel</p>
    </div>
  )
}
}
