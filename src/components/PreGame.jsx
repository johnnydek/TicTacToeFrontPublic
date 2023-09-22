import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { SocketContext } from '../socket'
import { useEffect } from 'react'
import { useState } from 'react'
import X from '../photo/x-symbol.png'
import O from '../photo/dry-clean.png'
import Sleep from '../photo/sleep.png'
import Happy from '../photo/happy.png'
import './Comp.css'



export default function PreGame(props) {
    const [playerAmount,setPlayerAmount] = useState(0)

    const [waitStatus,setWaitStatus] = useState('Awaiting Challenger...')

    const [opponentName, setOpponentName] = useState()

    const socket = useContext(SocketContext)

    const nav = useNavigate()


    const retireGame = async () =>{
   
    socket.emit('retireGame',
    {
      "gameName":props.game.name,
      "gameId":props.game.id
    })
  }


    useEffect(() => {

      socket.on('playersWaiting', (data) => {
        setPlayerAmount(data)

      });

      const handleUnload = () => {
        retireGame()
        socket.emit('cancelGame',(props.game.id))
      }

      window.addEventListener('beforeunload', handleUnload);

      window.addEventListener('popstate', handleUnload);

      return ()=>{
        // socket.emit('close');
        socket.off('playersWaiting')
        window.removeEventListener('beforeunload', handleUnload)

        window.removeEventListener('popstate', handleUnload)

      }
      
    }, []);

    useEffect(()=>{
      socket.on('message',(data)=>{
        console.log('received update')
        const message = JSON.parse(data)
        if(message.msg === 'retireGameSuccess'){
          socket.emit('cancelGame',(props.game.id))
          nav('/main');
        }else if(message.msg === 'retireGameError'){
          console.log('ERROR:', message.error);
        }
      
      })

      socket.on('gameReady',(data)=>{
          props.setPlayerTurn(true)
          nav('/board')
      })

      return ()=>{
        socket.off('message')
        socket.off('gameReady')
        socket.emit('close')
      }
    },[socket])


    useEffect(()=>{
      if(props.game.name !== undefined){
      if(playerAmount !== 0){
        setWaitStatus('Challenger Approaching!')
        let smiley = document.getElementById('smiley')

        smiley.src = Happy
        
        smiley.classList.remove('sleeping')

        void smiley.offsetWidth;

        smiley.classList.add('wakeUp')
      }
      else{
        setWaitStatus('Awaiting Challenger...')
        let smiley = document.getElementById('smiley')

        smiley.src = Sleep
        
        smiley.classList.remove('wakeUp')

        smiley.classList.add('sleeping')
      }
    }
    },[playerAmount])

    
    const chooseSymbol = (symbolButton) =>{
      let button
      let otherButton
      if(symbolButton === 'xbutton'){
        button = document.getElementById('xbutton')
        otherButton = document.getElementById('obutton')
        props.setSymbol('X')
      }
      else{
        button = document.getElementById('obutton')
        otherButton = document.getElementById('xbutton')
        props.setSymbol('O')
      }

      button.style.backgroundColor = 'green'
      otherButton.style.backgroundColor = 'gray'
    }

    const startRequest = ()=>{
      let whatSym = props.symbol
      if(whatSym === 'X'){
        socket.emit('startGame',{'id':props.game.id, 'symbol':'O'})
      }else{
        socket.emit('startGame',{'id':props.game.id, 'symbol':'X'})

      }
    }

if (props.game.name === undefined){
  return(
    <div className='CompApp'>
      <h1>NO GAME FOUND</h1>
      <h2>Click below to return to the main page:</h2>
      <button style={{color:'white', backgroundColor:'rgba(170, 170, 87)', width:'100px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{nav('/main')}}>Main Menu</button>
    </div>
  )
}
  
if (props.game.name !== undefined){
  return (
    <div className='CompApp'>
        <h1>{props.game.name} by {props.user.username}</h1>
        <h2 style={{fontWeight:'bold'}}>{waitStatus}</h2>
        <br/>
        <img id='smiley' src={Sleep} alt='sleep' style={{height:'90px', width:'90px', transform:'rotate(90deg)'}}/>
        <br/>
        <br/>
        {playerAmount > 0 && <button style={{color:'white', backgroundColor:'rgba(170, 170, 87)', width:'100px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{startRequest()}}>PLAY</button>}
        <br/>
        <br/>
        <button style={{color:'white', backgroundColor:'rgba(170, 170, 87)', width:'100px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{retireGame()}}>Cancel</button>
        <h2>Choose Symbol:</h2>
        <button id='xbutton' style={{'backgroundColor':'green'}} onClick={()=>{chooseSymbol('xbutton')}}><img src={X} style={{'height':'40px'}}/></button>  <button id='obutton' onClick={()=>{chooseSymbol('obutton')}}><img src={O} style={{'height':'40px'}}/></button>
    </div>
  )
}
}
