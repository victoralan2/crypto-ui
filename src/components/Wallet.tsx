import { invoke } from '@tauri-apps/api';
import React, { useEffect, useState } from 'react';
import Title from '../components/Title';



const Wallet: React.FC= () => {
    var [balance, setBalance] = useState<number>(0);
    var [sent, setSent] = useState<number>(0);
    var [timeCreated, setBalance] = useState<number>(0);

    useEffect(() => {
        const updateInfo = async () => {
            var [_balance, _timeCreated, _sent] = await invoke<[number, number, number]>("get_wallet_info");
            console.log("Time:" + _timeCreated);
            setBalance(_balance);
            setSent(_sent);
            setBalance(_timeCreated);
        }
        updateInfo();
    });
    function convertEpochToFormattedDate(epochSeconds: number): string {
        // Convert epoch seconds to milliseconds
        const date = new Date(epochSeconds * 1000);
        // Format the date into a readable string
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    return (
        <div style={{ margin: "50px", color: "#dbdbdb"}}>
            <Title title={"Wallet"}></Title>

            <div style={{display: "flex", height: "300px", marginTop: "50px", boxShadow: "10px 10px 10px 1px black"}}>
                <div style={containerStyle}>
                    <h2 style={{fontSize: "40px", lineHeight: "60px", marginTop: "10px", fontWeight:"lighter", fontFamily: "sans-serif", textDecoration: "underline" }}>Balance In Wallet</h2>
                    <p style={{fontSize: "50px", lineHeight: "60px", marginTop: "65px", fontFamily: "monospace"}}>{balance} RSN</p>
                </div>
                <div style={containerStyle}>
                    <h2 style={{fontSize: "40px", lineHeight: "60px", marginTop: "10px", fontWeight: "lighter", fontFamily: "sans-serif", textDecoration: "underline" }}>Resonance Sent</h2>
                    <p style={{fontSize: "50px", lineHeight: "60px", marginTop: "65px", fontFamily: "monospace"}}>{sent} RSN</p>
                </div>
                <div style={containerStyle}>
                    <h2 style={{fontSize: "40px", lineHeight: "60px", marginTop: "10px", fontWeight: "lighter", fontFamily: "sans-serif", textDecoration: "underline" }}>Wallet Creation Date</h2>
                    <p style={{fontSize: "50px", lineHeight: "60px", marginTop: "40px", fontFamily: "monospace"}}>{convertEpochToFormattedDate(timeCreated)}</p>
                </div>
            </div>
            <div style={navbarStyle}>
                <button onClick={() => {
                    invoke("try_unload_wallet");
                    window.location.reload();
                }} style={{ width: "100%", height: "100px", margin: "auto", fontSize: "20px", background: "transparent", color: "#dbdbdb"}}>Change Wallet</button>
            </div>
        </div>
    );
};

export default Wallet;

const containerStyle: React.CSSProperties = { width: "100%", border: "solid 1px white", padding: "5px", paddingLeft: "20px", backgroundColor: "#333" };
// Inline styles for simplicity
const navbarStyle: React.CSSProperties = {
    overflow: "hidden",
    position: "fixed",
    display: "flex",
    width: "100%",
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "#232323",
};