import React, { useState } from 'react';
import Nav from '../components/Navbar';
import ReceiveCrypto from '../components/ReceiveCrypto';

const Receive: React.FC = () => {
    return (
    <div>
        <Nav/>
        <div style={{marginTop: "100px"}}>
            <ReceiveCrypto/>
        </div>
    </div>
  );
};

export default Receive;
