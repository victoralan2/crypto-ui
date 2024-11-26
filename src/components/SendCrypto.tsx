import React, { useState } from 'react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/tauri'
import Title from './Title';
import { useNavigate } from "react-router-dom";


const SendCrypto: React.FC = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState<number>(0);
    const [address, setAddress] = useState("");
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);

    const errorText = useRef<HTMLParagraphElement>(null);
    const succsessText = useRef<HTMLParagraphElement>(null);


    const changeAmount = (amount: number) => {
        if (!Number.isInteger(amount)) {
            return;
        }
        setAmount(amount);
    };

    const handleSubmit = async () => {
    
        if (!Number.isInteger(amount) || amount <= 0) {
            return;
        }
        var error = await invoke<string>("create_transaction", {address, amount});
        if (error == "") {
            setAmount(0);
            setAddress("");
            if (errorText.current) {
                errorText.current.textContent = "";    
            }

            if (succsessText.current) {
                succsessText.current.textContent = "Transaction created succsefully";
            }
        } else {
            if (succsessText.current) {
                succsessText.current.textContent = "";
            }
            if (errorText.current) {
                console.log(error, address);
                errorText.current.textContent = error;
            }
        }
    };
    return (
        <div style={{ marginBottom: '20px', fontFamily: "sans-serif"}}>
            <Title title={"Send"} style={{margin: "50px"}}></Title>
            <div style={{width: "50%", display: "flex"}}></div>
            <div style={{width: "50%", margin: "auto"}}>
                <div style={{width: "100%", margin: "auto"}}>
                    <p style={{ margin: "20px", fontSize: "25px"}}>Address:</p>
                    <div style={{marginBottom: "50px"}}>
                        <input
                            style={{margin: "auto", marginBottom: "20px", width: "94%"}}
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="RSN:abcdefghijkm123456789"
                        />
                    </div>
                    <p style={{ margin: "20px", fontSize: "25px" }}>Amount: </p>
                    <div style={{marginBottom: "50px"}}>
                        <input
                            style={{margin: "auto", marginBottom: "20px", width: "94%"}}
                            type="number"
                            value={amount}
                            onChange={e => changeAmount(+e.target.value)}
                            placeholder="Enter amount"
                        />
                    </div>

                    <p ref={errorText} style={{display: "block", margin: "20px", color: "yellow"}}></p>
                    <p ref={succsessText} style={{display: "block", margin: "20px", color: "green"}}></p>
                    <button style={{display: "block", float: "right", marginBottom: "20px"}} onClick={handleSubmit} >
                        Create transaction
                    </button>
                    <div style={navbarStyle}>
                    <div style={{ width: "100%", height: "100px", margin: "auto", background: "transparent", fontSize: "20px", color: "#858383", lineHeight: "100px", textAlign: "center"}}>Send with address</div>
                        <button onClick={() => {navigate("./qr")}} style={{ width: "100%", height: "100px", margin: "auto", fontSize: "20px", background: "transparent"}}>Send using QR code</button>
                    </div>
                    
                </div>
                <div style={{width: "50%", margin: "auto"}}></div>
            </div>
        </div>
    );
};

export default SendCrypto;
const navbarStyle: React.CSSProperties = {
    position: "fixed",
    display: "flex",
    width: "100%",
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "#232323",
};
