import React, { useState } from 'react'
import { useEffect } from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { produce } from 'immer'
import './Comp.css'
import { socket } from '../socket'



export default function GameList(props) {
 const [activeGameList, setActiveGameList] = useState([]);
  const [mainDivHeight, setMainDivHeight] = useState(300);
  const [listDivHeight, setListDivHeight] = useState(200);
  const [waiting,setWaiting]=useState({'isWaiting':false})
  
  const nav = useNavigate()

  useEffect(() => {

    window.addEventListener('popstate', ()=>{
      leaveGame()
    });


    const handleuUnload = () =>{
      leaveGame()
    }

    window.addEventListener('beforeunload', handleuUnload);

    props.socket.on('gameList', (data) => {
      setActiveGameList(data.list);
    });

    props.socket.emit('getGameList')

    props.socket.on('gameIsCancelled', (data) => {
      props.socket.emit('roomDisconnect',data)
      setWaiting({'isWaiting':false})
      props.gameSet({'id':null})
    });
    


    props.socket.on('gameReady',(data)=>{
      props.symbolSet(data)
      props.turn(false)
      nav('/board')
    })

    // props.socket.on('occupiedGame',(data)=>{
    //   let gameButton = document.getElementById(`${data}`)

    //   gameButton.style.display = 'none'
    // })


    props.socket.on('freeGame',(data)=>{
      let gameButton = document.getElementById(`${data}`)

      gameButton.style.display = 'block'
    })

    return ()=>{
      // props.socket.emit('close')
      props.socket.off('gameList')
      props.socket.off('gameIsCancelled')
      props.socket.off('gameReady')
      props.socket.off('occupiedGame')
      props.socket.off('freeGame')
      window.removeEventListener('beforeunload', handleuUnload)
      window.removeEventListener('popstate', ()=>{})
    }
  }, []);


  const joinGame = (gameId, creator) =>{
    // setWaiting({'gameIde':gameId, 'isWaiting':true, 'host':creator})
     setWaiting((draft)=>{
                return produce(draft,(draftCopy)=>{
                    draftCopy['gameIde'] =gameId

                    draftCopy['isWaiting'] = true

                    draftCopy['host'] = creator
                })
            })
    props.gameSet({'id':gameId})
    props.socket.emit('playerJoin',gameId);
  }

  const leaveGame = ()=>{
    if(waiting.isWaiting == false){
      return
    }
    props.socket.emit('playerLeave',waiting.gameIde)
    props.gameSet({'id':null})
  }

  const updateHeight = () => {
    const mainDiv = document.getElementById('container');
    const listDiv = document.getElementById('activeGameList');

    if (mainDiv) {
      setMainDivHeight(mainDiv.scrollHeight);
    }

    if (listDiv) {
      setListDivHeight(listDiv.scrollHeight);
    }
  };

  useEffect(() => {
    updateHeight();
    
  }, [activeGameList]);



  return (
    <div className='CompApp' id='container' style={{'backgroundColor':'white','height':`${mainDivHeight}px`, 'border':'solid', 'borderRadius':'5%', 'borderRadius':'5%', 'border':'solid', 'borderColor':'rgba(170, 170, 87)', 'display':'flex','flexDirection':'column'}}>
        <h3>Choose a Game:</h3>
        <div id='activeGameList' style={{marginLeft:'0', width:'150px', height:`${listDivHeight}px`,display:'flex',flexWrap:'wrap',flexDirection:'row'}}>
          {activeGameList.map((val)=>{
              return <button onClick={()=>{joinGame(val._id, val.creator)}} className='gameListButton' id={val._id} style={{color:`${val.textColor}`, 'display': waiting.isWaiting === false ? 'block' : 'none', backgroundColor:`${val.color}`}}>{val.name} by {val.creator}</button>
           })}
           {waiting.isWaiting == true && <h3>Waiting for {waiting.host}... </h3>}
        </div>
        <br/>
        <div style={{marginLeft:'60%', width:'150px', height:'50px'}}> 
        <button style={{backgroundColor:'beige', width:'150px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{leaveGame(); props.closeMenu(false)}}>Back To Menu</button>
        </div>

    </div>
  )
}
