import React, { CSSProperties } from "react";

interface TitleProps {
    title: string;
    style?: CSSProperties;
}

const Title: React.FC<TitleProps> = ({title, style}) => {
    return (
        <div style={style}>
            <div style={{display: "flex"}}>
                <h1 style={{fontSize: "50px", fontFamily: "sans-serif", letterSpacing: "0px", textShadow: "5px 5px 1px black", textAlign: "left"}}>{title}</h1>
                <h1 style={{fontSize: "50px", fontFamily: "monospace", letterSpacing: "0px", textShadow: "5px 5px 1px black", textAlign: "left", marginLeft: "auto"}}>RESONANCE</h1>
        
            </div>
        </div>
    )
}
export default Title;