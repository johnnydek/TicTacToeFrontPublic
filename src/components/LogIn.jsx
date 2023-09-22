import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import './Comp.css'

export default function LogIn(props) {
    const nav = useNavigate();

    const verify = async (username,password) =>{
      let error = document.getElementById('errorMessage')
      await api.post('user/login',{
        "username":username,
        "password":password
    })
    .then((result)=>{
      props.setUser(result.data.userOutput)
      sessionStorage.setItem('userData',JSON.stringify(result.data.userOutput))
      nav('/main')
    })
    .catch((err)=>{
        if(err.response.status == 404){
        error.textContent = 'Username or password is incorrect!'
        }
        else{
          error.textContent = 'An error occurred. Please try again later'
        }
        return
    })
    }
    
  return (
    <div className = "CompApp">
        <h1>Welcome to Tic Tac Toe Online!</h1>
        <div style={{margin:'auto', backgroundColor:'white', width:'300px', height:'400px', borderRadius:'4%'}}>
        <h1 style={{fontWeight:'bold'}}>Sign In</h1>
            <p style={{marginLeft:'-40%', fontWeight:'bold'}}>Username</p>
            <input id="userName" type ="text" placeholder="Enter username"/>
            <br/>
            <br/>
            <p style={{marginLeft:'-40%', fontWeight:'bold'}}>Password</p>
            <input id="passWord" type ="password" placeholder="Enter password"/>
            <br/>
            <br/>
            <button style={{backgroundColor:'beige', width:'150px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{verify(document.getElementById("userName").value,
                                        document.getElementById("passWord").value)}}>LOGIN</button>
            <br/>
            <p id='errorMessage' style={{fontWeight:'bold', color:'red'}}></p>
            <br/>
            <a href='/signUp'>Not a member? click here to sign up!</a>
        </div>
        <h3>Game by Jonathan Dekel</h3>
    </div>
  )
}
