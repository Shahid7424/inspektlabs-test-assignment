import React from "react";
import "./styles.css";

export default function App() {
  const videoPlayer = React.useRef(null);
  const cameraCanvas = React.useRef(null);

  // State for camera functionality
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [frontCamera, setFrontCamera] = React.useState(true);
  const [capturedImage, setCapturedImage] = React.useState(null);
  const [capturedImageSize, setCapturedImageSize] = React.useState(null);
  const [fileName, setFileName] = React.useState("React Image");
  const [fileType, setFileType] = React.useState("png");

  // Define constraints for toggling front and back camera
  const getConstraints = () => ({
    video: {
      facingMode: frontCamera ? "user" : "environment"
    },
    audio: false
  });

  // Open camera
  const openCamera = () => {
    navigator.mediaDevices
      .getUserMedia(getConstraints())
      .then((stream) => {
        setCameraOpen(true);
        videoPlayer.current.srcObject = stream;
        videoPlayer.current.play();
      })
      .catch((err) => {
        setCameraOpen(false);
        console.error("An error occurred: " + err);
      });
  };

  // Close camera
  const closeCamera = () => {
    if (videoPlayer.current && videoPlayer.current.srcObject) {
      videoPlayer.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setCameraOpen(false);
  };

  // Capture image from video stream
  const captureImage = () => {
    const context = cameraCanvas.current.getContext("2d");
    context.drawImage(videoPlayer.current, 0, 0, cameraCanvas.current.width, cameraCanvas.current.height);
    cameraCanvas.current.toBlob(handleCapturedImage);
  };

  // Handle captured image
  const handleCapturedImage = (blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      setCapturedImageSize(formatFileSize(blob.size));
    };
  };

  // Download captured image
  const downloadRecording = () => {
    const filename = `${fileName}.${fileType}`;
    downloadFile(capturedImage, filename);
  };

  return (
    <div className="App">
      <h1>React Image Capture</h1>

      {!cameraOpen ? (
        <button onClick={openCamera}>Open Camera</button>
      ) : (
        <div className="controls">
          <button onClick={closeCamera}>Close Camera</button>
          <button onClick={captureImage}>Capture Image</button>
          <div>
            <label> Use Front Camera </label>
            <input
              type="checkbox"
              checked={frontCamera}
              onChange={() => {
                setFrontCamera(!frontCamera);
                closeCamera();
                setTimeout(openCamera, 100); // Restart the camera to apply the new facingMode
              }}
            />
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="download-options">
          <button onClick={downloadRecording}>Download ({capturedImageSize})</button>
          <input
            type="text"
            placeholder="File name to download"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
            <option value="png">png</option>
            <option value="jpg">jpg</option>
          </select>
        </div>
      )}

      {cameraOpen && (
        <div className="video-container">
          <video ref={videoPlayer} autoPlay playsInline></video>
        </div>
      )}

      <canvas width="360" height="360" ref={cameraCanvas} style={{ display: "none" }} />
    </div>
  );
}

// Helper function for downloading files
const downloadFile = (url, fileName) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function for formatting file size
const formatFileSize = (bytes, decimalPoint = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimalPoint;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
