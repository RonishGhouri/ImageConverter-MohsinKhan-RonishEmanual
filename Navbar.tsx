// import React from 'react'
import { useState } from 'react';
import './Navbar.css'


interface NavbarProps {
  onLoginButtonClick: () => void;
  onSignupButtonClick:()=> void;
}


const Navbar: React.FC<NavbarProps> = ({ onLoginButtonClick,onSignupButtonClick }) => {

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  // const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
const [isAlternateImage, setIsAlternateImage] = useState<boolean>(false);


  const handleMenuClick = () => {
    setIsMenuVisible(!isMenuVisible);
    setIsAlternateImage(!isAlternateImage);
  };
  return (
    

    <>

   
    <div  className='NavMain'>

      <div  className='Navpt1'>
      <div  className='MainText'  style={{color:"green"}}>
     <span>

  PNG 2 JPEG
</span>
      </div >

      <li>  Service</li>
      <li>  AboutUs</li>
      <li>  ContactUs</li>


      </div>
      {/* <div className='MenuM' style={{height:'40px',width:"40px"}}> */}

{/* <img src="./assets/menu.png" alt="" /> */}

{/* <span color='white'>Hashim</span> */}


{/* </div> */}


      <div  className='Navpt2'>

        <div  className='button' onClick={onLoginButtonClick}>

                  Login

        </div>
        <div  className='button'  style={{backgroundColor:'green'}} onClick={onSignupButtonClick}>

            Signup

          </div>


      </div>
      
     
     
      <img
  className="d"
  style={{ height: "28px", width: "28px", marginRight: "15px", cursor: "pointer" }}
  src={isAlternateImage ? "./assets/close.png" : "./assets/menu1.png"}
  alt=""
  onClick={handleMenuClick}
/>

    
    </div>

    {isMenuVisible && ( <div className='n2' style={{height:"170px", transition:"height 0.3 ease-in-out"}}> 


  <div className='g'>

  <li>  Service</li>
      <li>  AboutUs</li>
      <li>  ContactUs</li>

  </div>

  <div  className='Navpt3'>


<div  className='button1'  style={{backgroundColor:'white'}} onClick={onLoginButtonClick}>

    Login

  </div>

  <div  className='button1'  style={{backgroundColor:'green'}} onClick={onSignupButtonClick}>

    Signup

  </div>



</div>
           

     </div>)}


    </>
    
  )
}

export default Navbar;
