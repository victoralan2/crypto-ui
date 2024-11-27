import React, { useState } from 'react';
import Nav from '../components/Navbar';
import SendCryptoQR from '../components/SendCryptoQR';

const SendQR: React.FC = () => {

    return (
    <div>
        <Nav/>
        <div style={{marginTop: "100px"}}>
            <SendCryptoQR/>
        </div>
    </div>
  );
};

export default SendQR;
