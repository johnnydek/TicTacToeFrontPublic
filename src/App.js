import './App.css';
import {useState} from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import {socket,SocketContext} from './socket';
import { useEffect } from 'react';
import LogIn from './components/LogIn'
import SignUp from './components/SignUp'
import MainPage from './components/MainPage'
import PreGame from './components/PreGame';
import GameBoard from './components/GameBoard';
import Results from './components/Results';
import Disconnect from './components/Disconnect';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [currUser,setCurrUser] = useState({});
  const [hostedGame,setHostedGame] = useState({})
  const [playerSymbol,setPlayerSymbol] =useState('X')
  const [playerTurn,setPlayerTurn] =useState()
  const [gameResult,setGameResult] = useState(null)
  
  

  useEffect(() => {

  let loggedUser = sessionStorage.getItem('userData');

  if(loggedUser != null){

  let parsedData = JSON.parse(loggedUser)

    setCurrUser(parsedData)
  }
}, []);


  return (
    <div className="App">
      <SocketContext.Provider value={socket}>
      <BrowserRouter>
      <Routes>
      <Route path='/' element={<LogIn setUser = {setCurrUser}/>}/>
      <Route path='/signUp' element={<SignUp setUser = {setCurrUser}/>}/>
      <Route path='/main' element={<MainPage user= {currUser} setGame={setHostedGame} playerTurn = {setPlayerTurn} setSymbol = {setPlayerSymbol}/>}/>
      <Route path='/preGame' element={<PreGame game = {hostedGame} user = {currUser} setGame = {setHostedGame} setSymbol={setPlayerSymbol} setPlayerTurn={setPlayerTurn} symbol = {playerSymbol} />}/>
      <Route path='/board' element={<GameBoard finalResults = {setGameResult} playerMark = {playerSymbol} playerTurn ={playerTurn} gameID ={hostedGame.id} setPlayerTurn ={setPlayerTurn} username={currUser.username}/>}/>
      <Route path='/finalResult' element={<Results results = {gameResult}/>}/>
      <Route path='/disconnect' element={<Disconnect outcome = {gameResult} playerName = {currUser.username}/>}/>
      </Routes>
      </BrowserRouter>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
