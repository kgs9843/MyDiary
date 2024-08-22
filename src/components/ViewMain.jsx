import React from 'react';
import ViewNavbar from "./navbar/ViewTopbar";
import '../css/main.css'
import ViewStart from "./ViewStart"



function Main() {

    return (
        <div className='main-form'>
            <ViewNavbar />
            <ViewStart />
        </div>
    );
}

export default Main;