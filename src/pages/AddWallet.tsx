import React, { useState, useRef } from 'react';
import "../styles/AddWallet.css";
import DynamicStringList from '../components/DynamicStringList';

import { invoke } from '@tauri-apps/api/tauri'
import { useNavigate } from 'react-router-dom';

const AddWallet: React.FC = () => {
    var [name, setName] = useState<string>();
    var [password, setPassword] = useState<string>();
    var [trustedPeers, setTrustedPeers] = useState<string[]>([]);

    var [repeatedPassword, setRepeatedPassword] = useState<string>();
    const errorText = useRef<HTMLParagraphElement>(null);
    const navigator = useNavigate();
    function isValidName(input: string): boolean {
        const pattern = /^[a-zA-Z0-9]{1,15}$/; // Regex pattern
        return pattern.test(input); // Returns true if input matches the pattern
    }

    const createWallet = async (_: React.FormEvent) => {
        
        if (!name) {
            if (errorText.current) {
                errorText.current.textContent = "Name is empty"; 
                return;
            }
        } else {
            if (!isValidName(name)) {
                if (errorText.current) {
                    errorText.current.textContent = "Name is empty"; 
                } 
                return;
            }
        }
        
        if (password != repeatedPassword) {
            if (errorText.current) {
                errorText.current.textContent = "The passwords don't match"; 
            }
            return;
        }
        if (password && password.length < 5) {
            if (errorText.current) {
                errorText.current.textContent = "The password should be longer than 5 characters";
            }
            return;
        }
        if (trustedPeers.length == 0) {
            if (errorText.current) {
                errorText.current.textContent = "There should be at least one trusted node";
                return;
            }
        }
        if (errorText.current) {
            errorText.current.textContent = "";
        }
        const wallet_names = await invoke<string[]>('get_available_wallet_names');
        wallet_names.forEach((e) => {
            if (name == e) {
                if (errorText.current) {
                    errorText.current.textContent = "Wallet with that name already exists";
                }
            }
        });
        if (password) {
            invoke("create_new_wallet", { password: password, name: name, trustedPeers })
                .then((_) => {
                    navigator("/");
                })
                .catch((e) => {
                    
                });
        }
    }
    return (
    <div>
        <div style={{marginTop: "100px"}}>
            <h1 style={{textAlign: "center", fontSize: "70px"}}>Add a wallet</h1>
            <hr style={{height: "1px", border: "none", color: "rgba(255, 255, 255, 0.5)", backgroundColor: "rgba(255, 255, 255, 0.5)", margin: "50px", marginBottom: "70px"}}/>
            <div style={{width: "100%", display: "flex"}}>
                <div style={{width: "100%", margin: "auto"}}></div>
                <div style={{width: "100%", margin: "auto"}}>
                    <div style={{display: "block"}}>
                        <label style={{display: "flex", marginBottom: "20px", marginLeft: "5px", fontSize: "16px" }}>Enter the name of this wallet:</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="inputLabel"
                            type="text"
                            placeholder="Enter a name"
                        />
                    </div>

                    <div style={{display: "block", marginTop: "20px"}}>
                        <label style={{display: "flex", marginBottom: "20px", marginLeft: "5px", fontSize: "16px" }}>Enter a password twice:</label>
                        <input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            type="password"
                            className="inputLabel"
                            placeholder="Enter a password"
                        />
                        <input
                            value={repeatedPassword}
                            onChange={e => setRepeatedPassword(e.target.value)}
                            type="password"
                            className="inputLabel"
                            placeholder="Repeat the password"
                        />
                    </div>
                    <DynamicStringList onItemsChange={(x) => {setTrustedPeers(x)}}></DynamicStringList>
                    <p ref={errorText} style={{display: "block", color: "yellow"}}></p>
                    <button style={{display: "block", marginRight: "-30px", float: "right"}} onClick={createWallet}>
                        Add wallet
                    </button>
                </div>
                <div style={{width: "100%", margin: "auto"}}></div>
            </div>
        </div>
    </div>
  );
};

export default AddWallet;