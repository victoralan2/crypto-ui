import React, { useState } from 'react';
import { useRef } from 'react';
import jsQR from 'jsqr';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from "html5-qrcode";
import { invoke } from '@tauri-apps/api/tauri'
import { QrcodeResultFormat } from 'html5-qrcode/esm/core';
import Title from './Title';
import { useNavigate } from "react-router-dom";
import "../App.css"


interface SendCryptoQRProps {
    onSend: (amount: number, address: string) => boolean;
    isValid: (address: string) => boolean;
    balance: number;
}

const SendCryptoQR: React.FC<SendCryptoQRProps> = ({ onSend, isValid, balance }) => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState<number>(0);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);

    const errorText = useRef<HTMLParagraphElement>(null);
    const succsessText = useRef<HTMLParagraphElement>(null);

    const changeAmount = (amount: number) => {
        if (!Number.isInteger(amount)) {
            return;
        }
        setAmount(amount);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const html5qrcode = new Html5Qrcode("qr-code");

        const file = event.target.files?.[0];
        if (file) {
            html5qrcode.scanFile(file, true)
            .then(decodedText => {
                if (errorText.current) {
                    if (errorText.current.textContent == "QRCode not detected in provided image") {
                        errorText.current.textContent = "";
                    }
                }
                setQrCodeData(decodedText);  // QR code successfully read
            })
            .catch(e => {
                if (errorText.current) {
                    errorText.current.textContent = "QRCode not detected in provided image";
                    if (succsessText.current) {
                        succsessText.current.textContent = "";
                    }
                }
            });
        }
    };

    const handleSubmit = async () => {
    
        if (!Number.isInteger(amount) || amount <= 0) {
            return;
        }
        var error = await invoke<string>("create_transaction", {address: qrCodeData, amount});
        if (error == "") {
            setAmount(0);
            setQrCodeData("");
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
                console.log(error, qrCodeData);
                errorText.current.textContent = error;
            }
        }
    };
    return (
        <div style={{ marginBottom: '20px', fontFamily: "sans-serif"}}>
            <Title title={"Send QR"} style={{ margin: "50px"}}></Title>
            <div style={{width: "50%", display: "flex"}}></div>
            <div style={{width: "50%", margin: "auto"}}>
                <div style={{width: "100%", margin: "auto"}}>
                    <p style={{ margin: "20px", fontSize: "25px"}}>Address:</p>
                    <div style={{marginBottom: "50px"}}>
                        <input
                            id="qr-code"
                            style={{margin: "auto", marginBottom: "20px", width: "94%"}}                            
                            type="file"
                            accept='image/*'
                            onChange={handleFileChange}
                            placeholder="Enter address"
                        />
                    </div>
                    <p style={{ margin: "20px", fontSize: "25px" }}>Amount: </p>
                    <div style={{marginBottom: "50px"}}>
                        <input
                            style={{margin: "auto", marginBottom: "20px", width: "94%"}}
                            type="number"
                            value={amount}
                            onChange={e => changeAmount(+e.target.value)}
                            placeholder="Enter address"
                        />
                    </div>

                    <p ref={errorText} style={{display: "block", margin: "20px", color: "yellow"}}></p>
                    <p ref={succsessText} style={{display: "block", margin: "20px", color: "green"}}></p>
                    <button style={{display: "block", marginRight: "0px", float: "right", marginBottom: "20px"}} onClick={handleSubmit} >
                        Create transaction
                    </button>
                    <div style={navbarStyle}>
                        <button className="disabledButton" onClick={() => {navigate("/send")}} style={{ width: "100%", height: "100px", margin: "auto", fontSize: "20px", background: "transparent"}}>Send with address</button>
                        <div style={{ width: "100%", height: "100px", margin: "auto", background: "transparent", fontSize: "20px", color: "#858383", lineHeight: "100px", textAlign: "center"}}>Send using QR code</div>
                    </div>
                </div>
                <div style={{width: "50%", margin: "auto"}}></div>
            </div>
            
        </div>
    );
};

export default SendCryptoQR;
const navbarStyle: React.CSSProperties = {
    position: "fixed",
    display: "flex",
    width: "100%",
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "#232323",
};
