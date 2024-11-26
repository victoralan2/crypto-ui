import React, { useState } from 'react';
import Nav from '../components/Navbar';
import SendCryptoQR from '../components/SendCryptoQR';

const SendQR: React.FC = () => {


    let onSend = function (amount: number, address: string) {
        console.log("Sent " + amount + " to " + address);
        return true;
    };
    let isValid = function (address: string) {
        // TODO
        return true;
    };
    return (
    <div>
        <Nav/>
        <div style={{marginTop: "100px"}}>
            <SendCryptoQR onSend={onSend} isValid={isValid} balance={10}/>
        </div>
    </div>
  );
};

export default SendQR;
