import React, { useEffect, useState } from 'react';
import Nav from '../components/Navbar';
import Wallet from '../components/Wallet';
import { invoke } from '@tauri-apps/api';

const Home: React.FC = () => {

    return (
    <div>
        <Nav/>
        <div style={{marginTop: "100px"}}>
            <Wallet></Wallet>
        </div>
    </div>
  );
};

export default Home;
