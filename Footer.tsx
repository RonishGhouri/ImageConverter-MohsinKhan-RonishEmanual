// import React from 'react'

import './Footer.css'

export default function Footer() {
  return (

    <div className='MainCF'>

    <div  className='MainF'>
        
       <div  className='Row1'>

        <span  style={{fontSize:"17px"}}>Social Links</span>

        <div className='ic'>
            <img src="./assets/Facebook.png" alt="" />

         <span style={{fontSize:"14px",marginLeft:"12px"}}>Facebook</span>   

        </div>

        <div className='ic' >
            <img src="./assets/insta.png" alt="" />
             <span  style={{fontSize:"14px",marginLeft:"14px"}}>
             Instagram
             </span>
           

        </div>

        <div className='ic'>
            <img src="./assets/twitter.png" alt="" style={{height:"33px", width:"33px"}}/>

          <span style={{fontSize:"14px", marginLeft:"20px"}}>
          Twitter/X.com
            </span>  

        </div>

       </div>

       <div className='space' style={{height:"40px"}}>

       </div>


       <div className='Row2'>

       <span style={{fontSize:"17px"}}>Associated Links</span>
        <span style={{fontSize:"14px"}}>Service</span>
        <span style={{fontSize:"14px"}}>AboutUs</span>
        <span style={{fontSize:"14px", marginBottom:"0px"}}>ContactUs</span>

       </div>
       <div className='space' style={{height:"40px"}}>

</div>
       <div  className='Row3'>

        <span style={{fontSize:"17px"}}>Help & Support</span>

        <span style={{fontSize:"14px"}}>Help</span>

        <span style={{fontSize:"14px"}}>Term & Security</span>

        <span style={{fontSize:"14px", marginBottom:"0px"}}>FAQ'S</span>


       </div>

    </div>
    <div className='space' style={{height:"150px"}}>

</div>

    <p style={{marginTop:"5%", color:'white'}}>&copy; Copy Right All Rigth Reserved Png2jpeg.com.</p>


    </div>
  )
}
