import React, { useState, useRef, useEffect } from 'react';
import "../styles/OpenWallet.css";
import { invoke } from '@tauri-apps/api/tauri'
import { useNavigate } from 'react-router-dom';


const OpenWallet: React.FC = () => {
    var [password, setPassword] = useState<string>();
    var [name, setName] = useState<string>("");
    const [options, setOptions] = useState<string[]>([]);

    var [isDecrypting, setDecrypting] = useState<boolean>(false);
    var [errorMsg, setErrorMsg] = useState<string>("");


    useEffect(() => {
        const load_wallet_options = async () => {
            const wallet_names = await invoke<string[]>('get_available_wallet_names');
            setOptions(wallet_names);
        };
        load_wallet_options();
    })
    const openWallet = (_: React.FormEvent) => {
        if (password) {
            setDecrypting(true);
            invoke("try_load_wallet", { password, name })
                .then((_) => {
                    window.location.reload();
                })
                .catch((_) => {
                    setDecrypting(false);
                    setErrorMsg("Incorrect password, please try again");
                });
        }
    }
    if (isDecrypting) {
        return (
            <div style={{fontFamily: "sans-serif"}}>
                <h1 style={{textAlign: "center", fontSize: "70px", marginTop: "25%"}}>Decrypting your wallet...</h1>
                <p style={{textAlign: "center", fontSize: "15px", marginTop: "10px", fontStyle: "italic"}}>This might take a few seconds</p>
            </div>
        );
    } else {
        return (
            <div>
                <div style={{marginTop: "100px", fontFamily: "sans-serif"}}>
                    <h1 style={{textAlign: "center", fontSize: "70px"}}>Open a wallet</h1>
                    <hr style={{height: "1px", border: "none", color: "rgba(255, 255, 255, 0.5)", backgroundColor: "rgba(255, 255, 255, 0.5)", margin: "50px", marginBottom: "70px"}}/>
                    <div style={{width: "100%", display: "flex", marginTop: "120px"}}>
                        <div style={{width: "100%", margin: "auto"}}></div>
                        <div style={{width: "100%", margin: "auto"}}>
                            <div style={{display: "block"}}>
                                
                                <label style={{display: "flex", marginBottom: "20px", marginLeft: "5px", fontSize: "16px" }}>Wallet to open:</label>
                                {/* <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="inputLabel"
                                    type="text"
                                    placeholder="Enter the name"
                                /> */}
                                <select style={{width: "100%", appearance: "none", backgroundColor: "transparent", border: "2px solid white", padding: "5px", borderRadius: "8px" ,margin: "0", fontFamily: "inherit", fontSize: "inherit", cursor: "inherit", lineHeight: "inherit", color: "inherit"}} id="dropdown" value={name} onChange={e => setName(e.target.value)}>
                                    <option value="" disabled style={{backgroundColor: "#2f2f2f"}}>Select an option</option>
                                    {options.map((name, i) => (
                                    <option key={i} value={name} style={{backgroundColor: "#2f2f2f"}}>
                                        {name}
                                    </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{display: "block", marginTop: "70px"}}>
                                <label style={{display: "flex", marginBottom: "40px", marginLeft: "5px", fontSize: "16px" }}>Enter password:</label>
                                <input
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    type="password"
                                    className="inputLabel"
                                    placeholder="Enter the password"
                                />
                            </div>
                            <p style={{display: "block", color: "red"}}>{errorMsg}</p>
                            <button style={{display: "block", marginRight: "-30px", float: "right"}} onClick={openWallet}>
                                Open wallet
                            </button>
                        </div>
                        <div style={{width: "100%", margin: "auto"}}></div>
                    </div>
                </div>
            </div>
        );
    }

};

export default OpenWallet;