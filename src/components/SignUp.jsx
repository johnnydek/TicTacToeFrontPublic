import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import "./Comp.css"

export default function SignUp(props) {
    const nav = useNavigate();

    const timeToMove = (user)=>{
        sessionStorage.setItem('userData',JSON.stringify(user))
        nav('/main')
    }
    
    const verify= async(username,password,confirm)=>{

        let passCapCheck = false;
        let passSymCheck = false;
        let passNumCheck = false;
        let error = document.getElementById('errorMessage')
        let finalCopy = null
        let sameName = false;

        if(username.length < 2){
            error.textContent = "Username must be at least 2 characters long!"
            return 
        }

       await api.post('user/checkName',{
            "name":username,
        })
        .then((result)=>{
            sameName = result.data.msg
        })
        .catch((err)=>{
            error.textContent = 'An error occurred. Please try again later'
            console.log(err)
            return
        })

        if(sameName === 'taken'){
            error.textContent = `Username ${username} is already taken!`
            return
        }   
            if((password.length >= 8)){
                for(let i=0; i<password.length;i++){
                    if((password[i] >= 'A' && password[i] <= 'Z')){
                        passCapCheck = true;
                    }
                    if (password[i] >= '!' && password[i] <= '/' || password[i] >= ':' && password[i] <= '@' || password[i] >= '[' && password[i] <= '`'){
                        passSymCheck = true;
                    }
                    if (password[i] >= '0' && password[i] <= '9'){
                        passNumCheck = true;
                    }
                }
            }else{
                error.textContent = "Password must contain a minimum of 8 characters, lower and uppercase letters, at least one number, and one symbol."
                return
            }

            if(passCapCheck == false || passSymCheck == false || passNumCheck == false){
                error.textContent = "Password must contain a minimum of 8 characters, lower and uppercase letters, at least one number, and one symbol."
                return
            }

            if(password != confirm){
                error.textContent = "Passwords do not match!"
                return
            }

            await api.post('user/register',{
                "username":username,
                "password":password
            })
            .then((result)=>{
                props.setUser(result.data.userOutput)
                finalCopy = result.data.userOutput
            })
            .catch((err)=>{
                console.log('ERROR!',err)
                return
            })
            
            timeToMove(finalCopy)

    }
        
            
  return (
    <div className = "Comp">
    <div style={{margin:'auto', backgroundColor:'white', width:'300px', height:'400px', borderRadius:'4%'}}>
        <h1 style={{fontWeight:'bold'}}>User Sign Up</h1>
            <br/>
            <br/>
            <input id="userName" type ="text" placeholder="Username"/>
            <br/>
            <br/>
            <input id="passWord" type ="password" placeholder="Password"/>
            <br/>
            <br/>
            <input id="confirm" type = "password" placeholder="Confirm Password"/>
            <br/>
            <br/>
            <button style={{backgroundColor:'beige', width:'150px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{verify(document.getElementById("userName").value,
                                        document.getElementById("passWord").value,
                                        document.getElementById("confirm").value)}}>SIGN UP</button>
            <br/>
            <br/>
            <button style={{backgroundColor:'beige', width:'70px', boxShadow:'0px 0px 5px 5px rgba(02,0,0,0.1)', borderRadius:'10%'}} onClick={()=>{nav('/')}}>cancel</button>
    </div>
    <h3 id='errorMessage' style={{fontWeight:'bold' ,color:'red'}}></h3>
    </div>

  )
}
