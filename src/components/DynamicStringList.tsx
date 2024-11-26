import { invoke } from "@tauri-apps/api";
import React, { useState } from "react";

interface DynamicStringListProps {
    onItemsChange?: (items: string[]) => void; // Callback for the parent to get the updated items
}
const DynamicStringList: React.FC<DynamicStringListProps> = ({onItemsChange}) => {
  const [items, setItems] = useState<string[]>([]); // List of strings
  const [inputValue, setInputValue] = useState<string>(""); // Current input

  const handleAddItem = async () => {
    var isValid = await invoke<boolean>("is_valid_url", { url: inputValue } );
    if (isValid) {
        if (inputValue.trim() !== "") {
            setItems([...items, inputValue]); // Add inputValue to the list
            setInputValue(""); // Clear the input
            onItemsChange?.([...items, inputValue])
        }
    }
    
  };

  const handleRemoveItem = (index: number): void => {
    setItems(items.filter((_, i) => i !== index)); // Remove item by index
  };

  return (
    <div>
        <label style={{display: "flex", marginBottom: "20px", marginLeft: "5px", fontSize: "16px" }}>Trusted nodes:</label>
        <div>
            <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)} // Update inputValue
            placeholder="Enter a URL"
            />
            <button onClick={handleAddItem}>Add</button>
        </div>
        <ul>
            {items.map((item, index) => (
            <li key={index}>
                {item}{" "}
                <button onClick={() => handleRemoveItem(index)}>Remove</button>
            </li>
            ))}
        </ul>
    </div>
  );
};

export default DynamicStringList;
