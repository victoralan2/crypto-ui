// src/components/Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { IoMdSend } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { MdCallReceived } from "react-icons/md";


import '../styles/HoverButton.css'; // Import the CSS file for styling

interface NavbarButtonProps {
    to: string;
    text: string;
    Icon: React.ComponentType<any>;
}

const NavbarButton: React.FC<NavbarButtonProps> = ({ to, text, Icon }) => {
    return (
        <div>
            <Link style={linkStyle} to={to}>
                <div className="hover-button">
                    <span className="button-text">{text}</span>
                    <Icon style={iconStyle}/>
                </div>
            </Link>
        </div>
    );
};

const Navbar: React.FC = () => {
    return (
        <nav style={navbarStyle}>
            <ul style={navListStyle}>
                <li style={navItemStyle}><NavbarButton to="/send" text="Send" Icon={IoMdSend}></NavbarButton></li>
                <li style={navItemStyle}><NavbarButton to="/" text="Home" Icon={FaHome}></NavbarButton></li>
                <li style={navItemStyle}><NavbarButton to="/receive" text="Receive" Icon={MdCallReceived}></NavbarButton></li>
            </ul>
        </nav>
    );
};

// Inline styles for simplicity
const iconStyle: React.CSSProperties = {
    transitionDuration: "0.2s",
    fontSize: "30px",
};


// Inline styles for simplicity
const navbarStyle: React.CSSProperties = {
    position: "fixed",
    width: "100%",
    top: 0,
    right: 0,
    left: 0,
    backgroundColor: "#232323",
    outline: "solid 1px #dbdbdb",
    boxShadow: "1px 0px 10px #dbdbdb"
};

const navListStyle: React.CSSProperties = {
    listStyleType: "none",
    display: "flex",
    marginLeft: "-3%",
};

const navItemStyle: React.CSSProperties = {
    margin: "auto",
    color: "#dbdbdb",
    textAlign: "center",
};

const linkStyle: React.CSSProperties = {
    color: "#dbdbdb",
    textDecoration: "none",
    fontSize: "16px",
};

export default Navbar;
