import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useActionData } from 'react-router-dom';
import "./App.css";

import Home from './pages/Home';
import Receive from './pages/Receive';
import AddWallet from './pages/AddWallet';
import OpenWallet from './pages/OpenWallet';
import Send from './pages/Send';
import SendQR from './pages/SendQR';
import { invoke } from '@tauri-apps/api/tauri'


const App: React.FC = () => {
    const [exists, setExists] = useState<boolean | null>(null); // State to handle wallet existence
    const [isLoaded, setLoaded] = useState<boolean | null>(null); // State to handle wallet existence


    const checkForWallets = async () => {
        const wallet_names = await invoke<string[]>('get_available_wallet_names');
        console.log(wallet_names);
        setExists(wallet_names.length != 0); // Update state with the result

        if (wallet_names.length != 0) {
            const isLoaded = await invoke<boolean>('is_wallet_loaded');
            if (isLoaded) {
                console.log("Yep");
            } else {
                console.log("Nop");
            }
            setLoaded(isLoaded); // Update state with the result
        } else {
            setLoaded(false);
        }
    };
    useEffect(() => {
        checkForWallets();
    });
    
    if (exists) {
        if (isLoaded) {
            return (
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/receive" element={<Receive />} />
                        <Route path="/send" element={<Send />} />
                        <Route path="/send/qr" element={<SendQR />} />
                        <Route path="/add-wallet" element={<AddWallet />} />
                    </Routes>
                </Router>
            );
        } else {
            return (
                <Router>
                    <Routes>
                        <Route path="/*" element={<OpenWallet/>} />
                    </Routes>
                </Router>
            );
        }
    } else {
        return(
            <Router>
                <Routes>
                    <Route path="/*" element={<AddWallet />} />
                </Routes>
            </Router>
        );
    }
};

export default App;
