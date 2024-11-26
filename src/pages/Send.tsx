import React, { useState } from 'react';
import Nav from '../components/Navbar';
import ReceiveCrypto from '../components/ReceiveCrypto';
import SendCrypto from '../components/SendCrypto';

const Send: React.FC = () => {
    return (
    <div>
        <Nav/>
        <div style={{marginTop: "100px"}}>
            <SendCrypto/>
        </div>
    </div>
  );
};

export default Send;
