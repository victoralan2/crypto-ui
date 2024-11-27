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
import { useNavigate } from "react-router-dom";

const App: React.FC = () => {
    const [isLoaded, setLoaded] = useState<boolean>(false);
    const [exists, setExists] = useState<boolean>(false);

    const checkForWallets = async () => {
        const wallet_names = await invoke<string[]>('get_available_wallet_names');
        setExists(wallet_names.length != 0); // Update state with the result
        const isLoaded = await invoke<boolean>('is_wallet_loaded');
        setLoaded(isLoaded);
    };
    useEffect(() => {
        checkForWallets();
        
    });
    if (isLoaded) {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/receive" element={<Receive />} />
                    <Route path="/send" element={<Send />} />
                    <Route path="/send/qr" element={<SendQR />} />
                    <Route path="/add-wallet" element={<AddWallet />} />
                    <Route path="/*" element={<OpenWallet/>} />
                </Routes>
            </Router>
        );
    } else {
        return (
            <Router>
                <Routes>
                    <Route path="/add-wallet" element={<AddWallet />} />
                    <Route path="/" element={<OpenWallet/>} />
                </Routes>
            </Router>
        );
    }
};

export default App;
