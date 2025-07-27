'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function TestPage() {
  const onDrop = useCallback((acceptedFiles) => {
    // This will run when a file is dropped
    console.log('--- FILE DROPPED ---');
    console.log(acceptedFiles);
    alert(`File drop was successful! You dropped: ${acceptedFiles[0].name}`);
  }, []);
  
  const { getRootProps, getInputProps } = useDropzone({
     onDrop,
     // Add a click handler for debugging
     onClick: (event) => {
         console.log('--- CLICK DETECTED ---');
         event.stopPropagation(); // Prevents issues if there are multiple handlers
     }
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>File Upload Test</h1>
      <p>This is a separate page to test the upload functionality.</p>
      
      <div 
         {...getRootProps()} 
         style={{ 
             padding: '50px', 
             border: '3px dashed blue', 
             textAlign: 'center', 
             cursor: 'pointer',
             marginTop: '20px' 
         }}
     >
        <input {...getInputProps()} />
        <p>Drag & drop a file here, or click me.</p>
      </div>
    </div>
  );
}