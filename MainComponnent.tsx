import  { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './Button.tsx';
import JSZip from 'jszip';
// import FileList from './FileList.tsx';
import './MainComponent.css';
import React from 'react';

export default function MainComponent() {
  //const classes = useStyles();

    


    const [conversionType, setConversionType] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [convertedFiles, setConvertedFiles] = useState<File[]>([]);
    const [selectedButton, setSelectedButton] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    // const [selectedFilesCount, setSelectedFilesCount] = useState(selectedFiles.length);
    // useEffect(() => {
    //   setSelectedFilesCount(selectedFiles.length);
    // }, [selectedFiles]);
    
    const getFileType = (mimeType: string) => {
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return 'DOCX';
      } else {
        // If not a specific type, display the file type from the MIME type
        return mimeType.split('/').pop()?.toUpperCase() || '';
      }
    };


    const handleFileRemove = (event: React.MouseEvent,index: number) => {
      event.stopPropagation();
      const updatedFiles = [...selectedFiles];
  
      // Remove the file at the specified index
      updatedFiles.splice(index, 1);
      
      // Update the state with the new array of selected files
      setSelectedFiles(updatedFiles);
      
      // Remove the corresponding file from convertedFiles
      const updatedConvertedFiles = [...convertedFiles];
      updatedConvertedFiles.splice(index, 1);
      setConvertedFiles(updatedConvertedFiles);
    };

    const handleFileDownload =  (event: React.MouseEvent, file: File | null)=> {
      event.stopPropagation();
      if (!file) {
        console.error('Invalid file for download.');
        return;
      }
    
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
    
      // Append the link to the body and trigger the download
      document.body.appendChild(link);
      link.click();
    
      // Remove the link from the body
      document.body.removeChild(link);
    };
    

    const downloadAll = () => {
        // Check if there are converted files to download
        if (convertedFiles.length === 0) {
          console.warn('No converted files to download.');
          return;
        }
    
        // Create a new instance of JSZip
        const zip = new JSZip();
    
        // Add each converted file to the zip file
        convertedFiles.forEach((file, index) => {
          zip.file(`converted_file_${index + 1}`, file);
        });
    
        // Generate the zip file
        zip.generateAsync({ type: 'blob' })
          .then((blob) => {
            // Create a download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'converted_files.zip';
    
            // Append the link to the body and trigger the download
            document.body.appendChild(link);
            link.click();
    
            // Remove the link from the body
            document.body.removeChild(link);
          })
          .catch((error) => {
            console.error('Error generating zip file:', error);
          });
      };
      function createFileFromBlob(blob: Blob, fileName: string): File {
        const file = new File([blob], fileName, { type: blob.type });
        return file;
      }
      const [selectedFormat1, setSelectedFormat1] = useState<string>('');
      const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Handle the dropped image files here
        console.log('Dropped files:', acceptedFiles);
      
        // Ensure a conversion type is selected
        if (!conversionType) {
          window.alert('Please select a conversion type.');
          return;
        }
      
        // Filter out files that match the selected conversion type
        const filteredFiles = acceptedFiles.filter(file => {
          // Extract the file extension from the file name and convert it to lowercase
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
          // Extract the selected format from the conversionType, considering the part before '2', and convert it to lowercase
          const selectedFormat = conversionType.split('2')[0]?.toLowerCase();

          if (selectedFormat === 'jpg') {
            return fileExtension === 'jpg' || fileExtension === 'jpeg';
          }
        
          // Check if the selected format is 'word' and file extension is either 'docx' or 'doc'
          if (selectedFormat === 'word') {
            return fileExtension === 'docx' || fileExtension === 'doc';
          }
        
          // Check if the file extension matches the selected format for other cases
          return fileExtension === selectedFormat;
        });
        
        if (filteredFiles.length === 0) {
          window.alert(`No ${conversionType} files dropped. Please drop a valid file.`);
          return;
        }
      
        // Append newly selected files to the existing ones
        setSelectedFiles(prevFiles => [...prevFiles, ...filteredFiles]);
      
        if (round2Ref.current) {
          round2Ref.current.scrollLeft = round2Ref.current.scrollWidth;
        }
      
        // Perform API call for the selected conversion type
        if (conversionType) {
          try {
            const latestAcceptedFile = filteredFiles[filteredFiles.length - 1];
            setLoading(true);
      
            const response = await apiCall(latestAcceptedFile, conversionType);
            console.log("called", response.type);
      
            const formData = new FormData();

            const fileNameWithoutExtension = latestAcceptedFile.name.replace(/\.[^/.]+$/, "");


            const convfile= createFileFromBlob(response,fileNameWithoutExtension)
            formData.append('file', convfile);
      
            // Append newly converted files to the existing ones
            setConvertedFiles(prevConvertedFiles => [...prevConvertedFiles, convfile]);
            setLoading(false);
      
            // await fetch(`http://127.0.0.1:5000/convertedd_file`, {
            //   method: 'POST',
            //   body: formData,
            // });
      
            if (round2Ref.current) {
              round2Ref.current.scrollLeft = round2Ref.current.scrollWidth;
            }
          } catch (error) {
            console.error('Conversion error:', error);
          }
        }
      
        // Set a timeout to stop the loader after 2 minutes (120,000 milliseconds)
        const timeoutId = setTimeout(() => {
          setLoading(false);
        }, 520000);
      
        // Clear the timeout when the component unmounts or when the next drop occurs
        return () => clearTimeout(timeoutId);
      }, [conversionType, setConvertedFiles, setSelectedFiles, setLoading]);
      

      const onDrop1 = useCallback(async (acceptedFiles: File[]) => {
        // // Filter out non-image files
        // const imageFiles = acceptedFiles.filter(file => file.type.startsWith('file/'));
      
        // if (imageFiles.length === 0) {
        //   console.warn('No image files dropped.');
        //   return;
        // }
      
        // Handle the dropped image files here
        console.log('Dropped image files:', acceptedFiles);

      
        // Append newly selected image files to the existing ones
        setSelectedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
      
        if (round2Ref.current) {
          round2Ref.current.scrollLeft = round2Ref.current.scrollWidth;
        }
      
        // Perform API call for the selected conversion type
        if (conversionType) { 
          try {

           const latestAcceptedFile = acceptedFiles[acceptedFiles.length - 1];
           // const latestConvertedFile = selectedFiles[selectedFiles.length - 1];
           setLoading(true);
            const response = await apiCall(latestAcceptedFile, conversionType);
            console.log("called")
            console.log(response.type);

           
            const formData = new FormData();
            

           

           const fileNameWithoutExtension = latestAcceptedFile.name.replace(/\.[^/.]+$/, "");


            const convfile= createFileFromBlob(response,fileNameWithoutExtension)
            formData.append('file', convfile);
        
      
            // Append newly converted files to the existing ones
            setConvertedFiles(prevConvertedFiles => [...prevConvertedFiles,convfile]);
            setLoading(false);


            // await fetch(`http://127.0.0.1:5000/convertedd_file`, {
            //   method: 'POST',
            //   body: formData,
            // });
            if (round2Ref.current) {
              round2Ref.current.scrollLeft = round2Ref.current.scrollWidth;
            }
          } catch (error) {
            console.error('Conversion error:', error);
          }
        }
         // Set a timeout to stop the loader after 2 minutes (120,000 milliseconds)
  const timeoutId = setTimeout(() => {
    setLoading(false);
  }, 520000);

  // Clear the timeout when the component unmounts or when the next drop occurs
  return () => clearTimeout(timeoutId);
      }, [conversionType, setConvertedFiles,setSelectedFiles,setConvertedFiles]);
      
  
    // const onDrop = useCallback(async (acceptedFiles: File[]) => {
    //     // Handle the dropped files here
    //     console.log('Dropped files:', acceptedFiles);

    //     // const invalidFiles = acceptedFiles.filter(file => {
    //     //   const fileFormat = file.type.split('/').pop()?.toLowerCase();
    //     //   const selectedFormatLower = selectedFormat1?.toLowerCase();
         
    //     //   if(fileFormat==selectedFormatLower){
    //     //     return 0;
    //     //   }
         
    //     //   return 1;
    //     // });
        
    //     // if (invalidFiles.length == 1) {
    //       // Display a popup or show an error message
    //     //   alert('Invalid file format! Please select the correct format.');
    //     //   invalidFiles.length=0;
    //     //   return;
    //     // } 
        
    //     // Append newly selected files to the existing ones
    //     setSelectedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);

        

    //     if (round2Ref.current) {
    //         round2Ref.current.scrollLeft = round2Ref.current.scrollWidth;
    //       }
    
    //     // Perform API call for the selected conversion type
    //     if (conversionType) {
    //       try {
    //         const response = await apiCall(selectedFiles, conversionType);
            
    //         // Append newly converted files to the existing ones
    //         setConvertedFiles(prevConvertedFiles => [...prevConvertedFiles, ...response.data]);
    //         if (round2Ref.current) {
    //             round2Ref.current.scrollLeft = round2Ref.current.scrollWidth;
    //           }
    //       } catch (error) {
    //         console.error('Conversion error:', error);
    //       }
    //     }
    //   }, [conversionType, selectedFiles,setSelectedFormat1]);

    
    
    


      const clearQueue = () => {
        // Clear both selected and converted files
        setSelectedFiles([]);
        setConvertedFiles([]);
      };

      const handleConversionButtonClick = (type: string) => {

        console.log('Conversion Type:', type);
 
        setSelectedButton(type);
        // Set the selected conversion type
        setConversionType(type);
      };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const round2Ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    round2Ref.current = round2Ref.current; // This line ensures that the ref is updated
  }, [selectedFiles]);

  const scrollLeft = () => {
    if (round2Ref.current) {
      round2Ref.current.style.scrollBehavior = 'smooth';
      round2Ref.current.scrollLeft -= 100; // Adjust the scroll distance as needed
      
    }
  };

  const scrollRight = () => { 
    if (round2Ref.current) {
      round2Ref.current.style.scrollBehavior = 'smooth';
      round2Ref.current.scrollLeft += 100; // Adjust the scroll distance as needed
    }
  };

//   const isMobile = window.innerWidth <= 1000;


const handleFormatChange1 = (event: ChangeEvent<HTMLSelectElement>) => {
  setSelectedFormat1(event.target.value);
};

const [selectedFormat, setSelectedFormat] = useState<string>('');

const handleFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
  const selectedFormatValue = event.target.value;

  setSelectedFormat(selectedFormatValue);

  // Ensure both selectedFormat1 and selectedFormat have values
  if (selectedFormat1 && selectedFormatValue) {
    const conversionType = `${selectedFormat1}2${selectedFormatValue}`;
    handleConversionButtonClick(conversionType);
  }
};


  // const handleFormatChange6 = (event: ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedFormat(event.target.value);

  //   if (selectedFormat1 === "png" && selectedFormat === "jpg") {
  //     handleConversionButtonClick('png2jpg');
  //   } else if (selectedFormat1 === "jpg" && selectedFormat === "png") {
  //     handleConversionButtonClick('jpg2png');
  //   }
  //   else if (selectedFormat1 === "png" && selectedFormat === "jpeg") {
  //     handleConversionButtonClick('png2jpeg');
  //   }
  //   else if (selectedFormat1 === "webp" && selectedFormat === "jpg") {
  //     handleConversionButtonClick('webp2jpg');
  //   }
  //   else if (selectedFormat1 === "word" && selectedFormat === "jpeg") {
  //     handleConversionButtonClick('word2jpg');
  //   }
  //   else if (selectedFormat1 === "jpeg" && selectedFormat === "word") {
  //     handleConversionButtonClick('jpeg2word');
  //   }
  //   else if (selectedFormat1 === "pdf" && selectedFormat === "word") {
  //     handleConversionButtonClick('pdf2word');
  //   }
  //   else if (selectedFormat1 === "word" && selectedFormat === "pdf") {
  //     handleConversionButtonClick('word2pdf');
  //   }
  // };

  const renderOptions = () => {
    // Define the options array based on selectedFormat1
    let options: any[] = [];
  
    switch (selectedFormat1) {
      case 'png':
        options = ['jpg'];
        break;
      case 'jpg':
        options = ['png', 'word'];
        break;
      case 'webp':
        options = ['jpg'];
        break;
      case 'word':
        options = ['jpg', 'pdf'];
        break;
      case 'pdf':
          options = ['word'];
          break;  
      default:
        options = [];
    }
  
    return (
      <>
        <option value="">Select Format</option>
        {options.map((format) => (
          <option key={format} value={format} style={{ color: 'black' }}>
            {format.toUpperCase()}
          </option>
        ))}
      </>
    );
  };
  
  return (
    <div className="MainC">


       
<div className='mobileselect'>
<div className='select' style={{ textAlign: 'center' }}>
  {/* Display the selected format */}
  <select
    value={selectedFormat1}
    onChange={handleFormatChange1}
    style={{
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'white',
      textAlign: 'center', // Center the text within the select element
      fontWeight: 'bold',  // Make the selected option bold
    }}
  >
    <option value="">Select Format</option>
    <option value="png" style={{ color: 'black' }}>PNG</option>
    <option value="jpg" style={{ color: 'black' }}>JPG</option>
    <option value="webp" style={{ color: 'black' }}>WebP</option>
    <option value="word" style={{ color: 'black' }}>Word</option>
    {/* <option value="jpeg" style={{ color: 'black' }}>JPEG</option> */}
    <option value="pdf" style={{ color: 'black' }}>PDF</option>
  </select>
</div>

        <span>To</span>


        <div className='select'  style={{ textAlign: 'center' }}>
          {/* Use a select dropdown for format options */}
          <select value={selectedFormat} onChange={handleFormatChange} style={{
              backgroundColor: 'transparent',
              border: 'none',       
              outline: 'none',
              color: 'white',
              textAlign: 'center', // Center the text within the select element
              fontWeight: 'bold',  // Make the selected option bold
            }}>
            {renderOptions()}
          </select>
        </div>




      </div>
    
      <div className="ButtonsR">
        
      <Button
          text='Png to Jpg'
          onClick={() => handleConversionButtonClick('png2jpg')}
          isSelected={selectedButton === 'png2jpg'}
          onSelect={() => setSelectedButton('png2jpg')}
        />
         <Button
          text='jpg to png '
          onClick={() => handleConversionButtonClick('jpg2png')}
          isSelected={selectedButton === 'jpg2png'}
          onSelect={() => setSelectedButton('jpg2png')}
        />
         <Button
          text='Png to Jpeg'
          onClick={() => handleConversionButtonClick('png2jpeg')}
          isSelected={selectedButton === 'png2jpeg'}
          onSelect={() => setSelectedButton('png2jpeg')}
        />
         <Button
          text='Jpeg to png'
          onClick={() => handleConversionButtonClick('jpeg2png')}
          isSelected={selectedButton === 'jpeg2png'}
          onSelect={() => setSelectedButton('jpeg2png')}
        />
         <Button
          text='webp to Jpg'
          onClick={() => handleConversionButtonClick('webp2jpg')}
          isSelected={selectedButton === 'webp2jpg'}
          onSelect={() => setSelectedButton('webp2jpg')}
        />
        <Button
          text='Jpg to word'
          onClick={() => handleConversionButtonClick('jpg2word')}
          isSelected={selectedButton === 'jpg2word'}
          onSelect={() => setSelectedButton('jpg2word')}
        />
         <Button
          text='word to Jpeg'
          onClick={() => handleConversionButtonClick('word2jpg')}
          isSelected={selectedButton === 'word2jpg'}
          onSelect={() => setSelectedButton('word2jpg')}
        />
         
         <Button
          text='Pdf to word'
          onClick={() => handleConversionButtonClick('pdf2word')}
          isSelected={selectedButton === 'pdf2word'}
          onSelect={() => setSelectedButton('pdf2word')}
        />
         <Button
          text='word to Pdf'
          onClick={() => handleConversionButtonClick('word2pdf')}
          isSelected={selectedButton === 'word2pdf'}
          onSelect={() => setSelectedButton('word2pdf')}
        />
          
      </div>

    

      <div className="RoundBox">
        <p >
          <span style={{ fontWeight: 'bold' }}>Drag and Drop</span> your files here
        </p>

        <div className="Upload" {...getRootProps()}>
        <div className="pt1">
  <img style={{ filter: "invert(100%)" }} src='./assets/arrow.svg' alt="cross" />
</div>


          <div className="pt2">
            <span >Upload Here</span>
          </div>

         
          <input {...getInputProps()} />
        </div>

       


        <div className="SndPart" >
          {/* Your SndPart content */}
          

          <div className="bt1"  onClick={scrollLeft}> <img src="./assets/left.png" alt="" /></div>

          <div {...getRootProps()} className="Round2" ref={round2Ref}>
          {loading && (                   
            <div className="linear-loader">
             
            </div>
            // <span>l</span>
          )}


             {/* Display the converted files in SndPart */}

             {/* <FileList files={selectedFiles}></FileList> */}

          
          {convertedFiles.map((file, index) => (
            <div className='File' key={index}  >

<div className='r1' style={{display:"flex",justifyContent:"space-around", overflow:"none", position:"relative"}}>

<span className='filetop'>
      {file.name}
    </span>
    <div style={{width:"8%"}}>

    </div>
    <div className='crossbtn' onClick={(event) => handleFileRemove(event, index)}>
  <img src='/assets/cross.svg' alt="cross icon" />
</div>


</div>


         <div style={{display:"flex",justifyContent:"center",alignContent:"center"}}>

         <span className='filemid' >
                {/* {file.type && file.type.split('/').pop()?.toUpperCase()} */}
                {getFileType(file.type)}
                    </span>


         </div>
                
              

                    <div className='filedown' style={{cursor:'pointer'}} onClick={(event) => handleFileDownload(event, file)}>

                     <span>Download</span> 

                    </div>
                
                </div>
          ))}

{/* {convertedFiles.map((file, index) => (
            <div className='File' key={index}>
                
                <span>
                {file.type}
                    </span>
                
                </div>
          ))} */}
          </div>

          <div className="bt2" onClick={scrollRight}>
          <img src="./assets/right.png" alt="" />
          </div>
         
        </div>

        <div className="Upload"  onClick={clearQueue}>
          <div className="pt1" style={{ backgroundColor: 'red' }}>
          <img style={{ filter: "invert(100%)", height: "35px" }} src='./assets/cross.svg' alt="cross" />
          </div>

          <div className="pt2" style={{ backgroundColor: 'red' }}>
            <span>Clear Queue</span>
          </div>
        </div>
      </div>

      <div className="Download" style={{ display: 'flex', flexDirection: 'row' }}>
  <div className="pt1" style={{ backgroundColor: 'black' }}>
    <img style={{ filter: "invert(100%)", transform: "rotate(180deg)" }} src='./assets/arrow.svg' alt="downward arrow" />
  </div>

  <div className="pt2" style={{ backgroundColor: 'black'}} onClick={downloadAll}>
    <span style={{ color: 'white' }}>Download All</span>
   
  </div>

  <div className='counter1'>
  <span>{convertedFiles.length}</span>
  </div>
 
</div>

    </div>
  );
}

function createFileFromBlob(blob: Blob, originalFileName: string): File {
  const file = new File([blob], originalFileName, { type: blob.type });
  return file;
}


const apiCall = async (file: File, conversionType: string) => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file); // Assuming 'file' is the parameter name expected by the server

    // Append conversion type to FormData
    formData.append('conversionType', conversionType);

    console.log(formData);

    const response = await fetch(`http://127.0.0.1:5000/convert/${conversionType}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    // Extract the original file name
    const originalFileName = file.name;

    console.log(originalFileName)
    // Convert the response to a Blob
    const blob = await response.blob();

    // Create a File object with the original file name
    const convertedFile = createFileFromBlob(blob, originalFileName);

    // Log the converted file object (optional)
    console.log('Converted File:', convertedFile);

    // Return the converted File object
    return convertedFile;
  } catch (error) {
    console.error('API call error:', error);
    throw error; // Re-throw the error to handle it appropriately
  }
};


// // Replace this with your actual API call function
// const apiCall = async (files: any, conversionType: string) => {
//   // Perform your API call here
//   // Example: Using fetch
  
//   console.log('Conversion Type:', conversionType);
//   const response = await fetch(`http://127.0.0.1:5000/convert/${conversionType}`, {
//     method: 'POST',
//     body: JSON.stringify({ files }),
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     throw new Error('API call failed');
//   }

//   return response.json();
// };