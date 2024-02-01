// SelectedFilesList.tsx
import React from 'react';

import './FileList.css'

interface FileListProps {
  files: File[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  return (
    <div >
      {files.map((file, index) => (
        <div className='File' key={index}>{file.name}</div>
      ))}
    </div>
  );
};

export default FileList;
