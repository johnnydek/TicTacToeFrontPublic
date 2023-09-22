import React from 'react'
import { useContext } from 'react'
import { SocketContext } from '../socket.js'
import { useEffect } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import { produce } from 'immer'
import { useNavigate } from 'react-router-dom'
import X from '../photo/x-symbol.png'
import O from '../photo/dry-clean.png'
import Star from '../photo/star.png'

export default function GameBoard(props) {
    const [otherPlayer,setOtherPlayer] =useState({})

    const [victoryCheckTrigger, setVictoryCheckTrigger] = useState(0);

    const [roundCheckTrigger, setRoundCheckTrigger] = useState(0);

    const [cutscene,setCutscene] = useState(false)

    const [winStatus,setWinStatus] = useState(false)

    const [tieMode,setTieMode] = useState(false)

    const [round,setRound] = useState(0)

    const [scores,setScores] = useState({'player':0,'opponent':0})
    
    const [ticTable,setTicTable] = useState([  
        0,0,0,
        0,0,0,
        0,0,0])

    const dataSymbolRef = useRef(null);

    const socket = useContext(SocketContext)

    const nav = useNavigate()



    useEffect(() => {
        setTimeout(() => {
            socket.emit('sendPlayer',{'name':props.username, 'id':props.gameID})
          }, 600);

        const handleUnload = () => {
        socket.emit('stopGame',(props.gameID))
        }

      window.addEventListener('beforeunload', handleUnload);

      window.addEventListener('popstate', ()=>{
        socket.emit('stopGame',(props.gameID))
      });


        socket.on('getOpponentData',(data)=>{
            console.log('recevie player data')
            setOtherPlayer({'name':data,'wins':0})
        })

        socket.on('yourMove',(data)=>{
            // const updatedTicTable = ticTable 
            // updatedTicTable[data.square] = data.symbol;

            dataSymbolRef.current = data.symbol;

            setTicTable((draft) => {
                return produce(draft, (draftCopy) => {
                    draftCopy[data.square] = data.symbol;
                });
            });
            let cell = document.getElementById(`${data.square}`)
            const img = document.createElement('img')

            if(props.playerMark === 'O'){
                img.src = X
                img.height = '90'
                img.width = '90'
            }
            else{
                img.src = O
                img.height = '90'
                img.width = '90'
            }
            cell.append(img)
            
            // setTicTable(updatedTicTable)

            setVictoryCheckTrigger((prev) => prev + 1);



        })

        socket.on('winner',(data)=>{
            let firstSymbol = document.getElementById(`${data.symbolA}`)
            let secondSymbol = document.getElementById(`${data.symbolB}`)
            let thirdSymbol = document.getElementById(`${data.symbolC}`)

            firstSymbol.style.backgroundColor = 'green'
            secondSymbol.style.backgroundColor = 'green'
            thirdSymbol.style.backgroundColor = 'green'

            
            setCutscene(true)

            setWinStatus(true)

            setScores((draft)=>{
                return produce(draft,(draftCopy)=>{
                    draftCopy.player = draftCopy.player + 1
                })
            })

            drawStars(true)
        })


        socket.on('whatRound',(data)=>{
            
            setRound(data)

            startNextGame()

            props.setPlayerTurn(false)
        })


        
        socket.on('tieGame',()=>{
            setTieMode(true)

            setWinStatus(true)

        })

        socket.on('finishGame',(data)=>{
            props.finalResults(data)
            nav('/finalResult')
        })

        socket.on('haltGame',()=>{
            dataSymbolRef.current = -2
            setRoundCheckTrigger(-1)
        })

        return ()=>{
            socket.off('getOpponentData')
            socket.off('yourMove')
            socket.off('winner')
            socket.off('whatRound')
            socket.off('tieGame')
            socket.off('finishGame')
            socket.off('haltGame')
            window.removeEventListener('beforeunload', handleUnload)
            window.removeEventListener('popstate', handleUnload);
            socket.emit('close')
          }
      }, []);

      useEffect(() => {
        const symbol = dataSymbolRef.current;

        checkVictory(symbol, ticTable);
    }, [victoryCheckTrigger]);


    useEffect(() => {
        if(dataSymbolRef.current === -1){
        nextRound(round,scores)
        }

        if(dataSymbolRef.current === -2){
            ceaseGame(scores)
        }
    }, [roundCheckTrigger]);


      useEffect(() => {
        if(cutscene === true || tieMode === true){
            const isTicTableReset = ticTable.every(value => value === 0);

            if (isTicTableReset) {

                setCutscene(false)

                setTieMode(false)

                if(winStatus === true){
                    props.setPlayerTurn(true)
                    setWinStatus(false)
                }

            } else {
                
                setTicTable((draft) => {
                    return produce(draft, (draftCopy) => {
                        for (let i = 0; i < draftCopy.length; i++) {
                            draftCopy[i] = 0;
                        }
                    });
                });
            }
        }
   
        
    }, [ticTable]);



    const ceaseGame = (score) =>{
        if(score.player > score.opponent){
            props.finalResults(props.username)
        }else{
            props.finalResults('end')
        }
        nav('/disconnect')
    }

    const victorySeq = (symbol1,symbol2,symbol3)=>{
        let firstSymbol = document.getElementById(`${symbol1}`)
        let secondSymbol = document.getElementById(`${symbol2}`)
        let thirdSymbol = document.getElementById(`${symbol3}`)

        firstSymbol.style.backgroundColor = 'red'
        secondSymbol.style.backgroundColor = 'red'
        thirdSymbol.style.backgroundColor = 'red'

        socket.emit('roundWin',{'id':props.gameID, 'sym1':symbol1,'sym2':symbol2,'sym3':symbol3})

        setCutscene(true)

        // setScores({'player':tempP,'opponent':tempO})

        setScores((draft)=>{
            return produce(draft,(draftCopy)=>{
                draftCopy.opponent = draftCopy.opponent + 1
            })
        })

        dataSymbolRef.current = -1

        drawStars(false)

        setTimeout(() => {
            setRoundCheckTrigger((prev) => prev + 1);
          }, 2200);

    }

    const tieSeq = () =>{
        setTieMode(true)

        socket.emit('tieReport',props.gameID)

        dataSymbolRef.current = -1

        setTimeout(() => {
            setRoundCheckTrigger((prev) => prev + 1);
          }, 2200);
    }

    const checkVictory = (player,updatedTable) => {
        for (let i = 0; i < 3; i++) {
            if (
                updatedTable[i * 3] === player &&
                updatedTable[i * 3 + 1] === player &&
                updatedTable[i * 3 + 2] === player
            ) {
                victorySeq(i*3,i*3 +1, i*3 + 2)
                return
            }
        }
        for (let i = 0; i < 3; i++) {
            if (
                updatedTable[i] === player &&
                updatedTable[i + 3] === player &&
                updatedTable[i + 6] === player
            ) {
                victorySeq(i,i+3, i+6)
                return
            }
        }
        if ((updatedTable[0] === player && updatedTable[4] === player && updatedTable[8] === player)) {
            victorySeq(0,4,8)
            return
        }else if( (updatedTable[2] === player && updatedTable[4] === player && updatedTable[6] === player)){
            victorySeq(2,4,6)
            return
        }else if(updatedTable.every(val => val !== 0)){
            tieSeq()
            return
        }
        if(dataSymbolRef.current !== null){
        props.setPlayerTurn(true) 
        }  
        return;
    }
    


    const addMark = (square)=>{
        if(props.playerTurn === true && ticTable[square] === 0){
        let cell = document.getElementById(`${square}`)
        // let temp = ticTable
        // if(temp[square] === 0){
        //     props.setPlayerTurn(false)
        //     if(props.playerMark === 'X'){
        //         temp[square] = 1
        //         symbol = 1
        //     }else{
        //         temp[square] = 2
        //         symbol = 2
        //     }
        // }else{
        //     return
        // }

        let symbol = null

        if (props.playerMark === 'X') {
            symbol =1
        }else{
            symbol =2
        }

        setTicTable((draft) => {

            return produce(draft, (draftCopy) => {
                if (draftCopy[square] === 0) {
                    props.setPlayerTurn(false);
                    if (props.playerMark === 'X') {
                        draftCopy[square] = 1;
                    } else {
                        draftCopy[square] = 2;
                    }
                }
            });
        });

        console.log('symbol is:', symbol)

        const img = document.createElement('img')
        if(props.playerMark === 'X'){
            img.src = X
            img.height = '90'
            img.width = '90'
        }
        else{
            img.src = O
            img.height = '90'
            img.width = '90'
        }
        cell.append(img)
        // setTicTable(temp)

        socket.emit('switchTurn',{'id':props.gameID, 'block':square, 'symbol':symbol})

    }

        return

  
    }

    const drawStars = (status) =>{
        let starCounter

        if(status){
            starCounter = document.getElementById('stars')
        }else{
            starCounter = document.getElementById('opponentStars')
        }
     
            const img = document.createElement('img')
            img.src = Star
            img.alt = 'Star'
            img.className = 'star-image'


            starCounter.append(img)

    }

    const nextRound = (whatRound,score) =>{
        dataSymbolRef.current = 0

        switch(whatRound){
            case 0:
                startNextGame()
                setRound(1)
  
                socket.emit('roundSend',{'id':props.gameID, 'round':1})
                break;
            case 1:
                if(score.opponent == 2 && score.player == 0){
                    props.finalResults(otherPlayer.name)
                    socket.emit('endGame',{'id':props.gameID, 'winner':otherPlayer.name})
                    nav('/finalResult')
                }else{
                    startNextGame()
                    setRound(2)
                    socket.emit('roundSend',{'id':props.gameID, 'round':2})
                }
                break;
            case 2:
                if(score.opponent > score.player){
                    props.finalResults(otherPlayer.name)
                    socket.emit('endGame',{'id':props.gameID, 'winner':otherPlayer.name})
                    nav('/finalResult')

                }else if(score.opponent < score.player){
                    props.finalResults(props.username)
                    socket.emit('endGame',{'id':props.gameID, 'winner':props.username})
                    nav('/finalResult')
                }
                else{
                    props.finalResults('tie')
                    socket.emit('endGame',{'id':props.gameID, 'winner':'tie'})
                    nav('/finalResult')
                }
                break;
        }
        
    }


    const startNextGame = () =>{
        
            for(let i =0; i< 9 ; i++){
                let cell = document.getElementById(`${i}`)

                const imgElement = cell.querySelector('img')

                if(imgElement){
                    cell.removeChild(imgElement)
                }

                cell.style.backgroundColor =''
            }
            setTicTable((draft) => {
                return produce(draft, (draftCopy) => {
                    for (let i = 0; i < draftCopy.length; i++) {
                        draftCopy[i] = 0;
                    }
                });
            });
    }


    if (props.gameID === undefined){
        return(
          <div className='errorClass'>
            <h1>NO GAME FOUND</h1>
            <h2>Click below to return to the main page:</h2>
            <button style={{fontWeight:'bold', fontSize:'large', color:'white', backgroundColor:'rgba(170, 170, 87)', width:'170px', height:'50px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{nav('/main')}}>Main Menu</button>
          </div>
        )
      }


    if (props.gameID !== undefined){

  return (
    <div id ='gameTable' className='row  justify-content-center align-items-center'>
        <div className='col-xl-4 col-lg-4 mt-3 mb-3 order-lg-2'>
        <h1 style={{fontWeight:'bold'}}>ROUND {round+1}</h1>
        <table class='tableStyle' style={{margin:'auto'}}>
            <tr>
                <td id='0'className='tdStyle' onClick={()=>{addMark(0)}}></td>
                <td id='1' className='tdStyle' onClick={()=>{addMark(1)}}></td>
                <td id='2' className='tdStyle' onClick={()=>{addMark(2)}}></td>
            </tr>
            <tr>
                <td id='3' className='tdStyle' onClick={()=>{addMark(3)}}></td>
                <td id='4' className='tdStyle' onClick={()=>{addMark(4)}}></td>
                <td id='5' className='tdStyle' onClick={()=>{addMark(5)}}></td>
            </tr>
            <tr> 
                <td id='6' className='tdStyle' onClick={()=>{addMark(6)}}></td>
                <td id='7' className='tdStyle' onClick={()=>{addMark(7)}}></td>
                <td id='8' className='tdStyle' onClick={()=>{addMark(8)}}></td>
            </tr>
        </table>
        <br/>
        <h1>{props.playerTurn ? "YOUR MOVE" : `${otherPlayer.name}'s TURN`}</h1>
        </div>

        <div className = 'col-xl-3 col-lg-4 col-md-4 col-4 order-lg-1'>
        <div className='playerPortrait' style={{margin:'auto'}}>
            <h1>YOU:</h1>
            <h1>{props.username}</h1>
            <h2 style={{fontSize:'35px'}}>{props.playerMark}</h2>
            <div id='stars' style={{'width':'100%','height':'100px', 'margin':'auto','alignItems':'center'}}> </div>
        </div>
        </div>

        <div className = 'col-xl-3 col-lg-3 col-md-4 col-4 order-lg-3'>
        <div className='playerPortrait' style={{margin:'auto'}}>
            <h1>OPPONENT:</h1>
            <h1>{otherPlayer.name}</h1>
            <h2  style={{fontSize:'35px'}}>{props.playerMark === 'X' ? "O" : "X"}</h2>
            <div id='opponentStars' style={{'width':'100%','height':'100px', 'margin':'auto','alignItems':'center'}}> </div>
        </div>
        </div>
         {cutscene == true && <h1 style={{'border':'solid', 'backgroundColor':'gold', 'position':'absolute','margin':'auto'}}>{winStatus ? "YOU WIN" : `${otherPlayer.name} WON`}</h1>}
         {tieMode == true && <h1 style={{'border':'solid', 'backgroundColor':'gray', 'position':'absolute','margin':'auto'}}>TIE</h1>}

    </div>

  )

}
}
