// Select.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Select = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        console.log("filecontent",fileContent)
        try {
          const carArray = JSON.parse(fileContent);
          onFileUpload(carArray); // Callback to pass data to parent component
          console.log(carArray)
          // Programmatically navigate to the /play-me route
        
        navigate('/play-me');
        } catch (error) {
          alert('Error parsing JSON file. Please select a valid JSON file.');
        }
      };
      reader.readAsText(selectedFile);
    } else {
      alert('Please select a JSON file before uploading.');
    }
  };

  return (
    <div>
  <h2>Upload JSON File</h2>
  <input type="file" accept=".json" onChange={handleFileChange} />
  <button onClick={handleUpload}>Upload</button>
</div>

  );
};

export default Select;
