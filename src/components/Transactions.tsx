import React from 'react';
import { GrTransaction } from "react-icons/gr";
import { GrMoney } from "react-icons/gr";

interface Transaction {
    id: number;
    incomming: number;
    outgoing: number;
}

interface TransactionsProps {
    transactions: Transaction[];
}

const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{display: "flex"}}>
                <GrMoney style={iconStyles}></GrMoney>
                <GrMoney style={iconStyles}></GrMoney>
                <GrTransaction style={iconStyles}></GrTransaction>
            </div>
            
            <div style={{display: "flex", marginTop: "10px"}}>
                <p style={labelStyles}>Net balance</p>
                <p style={labelStyles}>Incoming RSN</p>
                <p style={labelStyles}>Outgoing RSN</p>
            </div>
            <hr></hr>
            <ul style={{ listStyleType: 'none', padding: 0}}>
                {transactions.map(tx => (
                    <div>
                        <li key={tx.id} style={{ marginBottom: '-1px', display: "flex", borderBottom: "solid 1px #ffffffaa"}}>
                            <div style={txItemStyles} >{tx.incomming - tx.outgoing}</div>
                            <div style={txItemStyles}> {tx.incomming}</div> 
                            <div style={{margin: "auto", textAlign: "center", width: "100%", paddingBottom:"10px"}}>{tx.outgoing}</div> 
                        </li>
                    </div>
                ))}

            </ul>
        </div>
    );
};

const iconStyles: React.CSSProperties = {margin: "auto", textAlign: "center", width: "100%", fontSize: "40px"}
const labelStyles: React.CSSProperties = {margin: "auto", textAlign: "center", width: "100%", fontSize: "20px"}
const txItemStyles: React.CSSProperties = {margin: "auto", textAlign: "center", width: "100%", borderRight: "solid 1px #ffffffaa", paddingBottom:"10px"}

export default Transactions;
