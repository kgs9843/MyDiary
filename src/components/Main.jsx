import React from 'react';
import Navbar from "./navbar/topbar";
import '../css/main.css'
import StartScreen from "./StartScreen"



function Main() {

    return (
        <div className='main-form'>
            <Navbar />
            <StartScreen />
        </div>
    );
}

export default Main;