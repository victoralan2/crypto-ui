import React, { useEffect, useState } from 'react';
import QRCodeComponent from "../components/QRCode";
import { invoke } from '@tauri-apps/api/tauri'
import Title from './Title';

const  ReceiveCrypto = () => {
    var [address, setAddress] = useState<string>("");
    useEffect(() => {
        const load_address = async () => {
            setAddress(await invoke<string>("get_wallet_address"));
        }
        load_address();
    })
    return (
        <div style={{ margin: "50px", marginBottom: '20px', fontFamily: "sans-serif" }}>
            <Title title={"Receive"}></Title>

            <p style={{marginTop: "-30px", textAlign: "center", fontSize: 30}}>This is your address:</p>
            <p style={{textAlign: "center", fontSize: 25, userSelect: "all"}}>{address}</p>

            <p style={{textAlign: "center", fontSize: 30}}>Optionally you can use this QR code:</p>
            <div style={{display: "flex"}}>
                <QRCodeComponent dataForQRcode={address} quality={20} style={{width: "400px", boxShadow: "0px 0px 10px black"}}/>
            </div>

        </div>
    );
};

export default ReceiveCrypto;
