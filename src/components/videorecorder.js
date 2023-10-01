import React, { useCallback, useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Webcam from "react-webcam";
import {Button} from "@mui/material";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils"; 

// const VideoRecorder = forwardRef((props, ref)=> {
const VideoRecorder = (props) => {
  const {height, width, setSnackbarOpen} = props;
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const videoConstraints = {
    // width: width,
    // height: height,
    facingMode: "user",
  };

  // head rot axis threshold angle 
  const thresholdAngle = 5;

  // return (
  //   <div className="Container">
  //     <Webcam
  //       height={450}
  //       width={500}
  //       audio={false}
  //       mirrored={true}
  //       ref={webcamRef}
  //       videoConstraints={videoConstraints}
  //     />
  //   </div>
  // );


  var camera = null;

  // const [showPopup, setSnackbarOpen] = useState(false);

  function calculateAngle(landmarks) {
    const leftEar = landmarks[234]; // Left ear tip
    const rightEar = landmarks[454]; // Right ear tip

    const deltaY = rightEar.y - leftEar.y;
    const deltaX = rightEar.x - leftEar.x;

    const angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    return angleInDegrees;
  }

  function onResults(results) {
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        const angle = calculateAngle(landmarks);
        if (angle > thresholdAngle || angle < -thresholdAngle) { // Adjust this threshold as needed
          setSnackbarOpen(true);
        } 
        else {
          setSnackbarOpen(false);
        }
      }
    }
  }

  
  // useImperativeHandle(ref, () => ({
  //   stopCam(){
  //     if(camera){
  //       console.log('stop cam')
  //       // camera.stop();
  //     }
  //   }
  // }));

  
  useEffect(() => {
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });
  
      faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
  
      faceMesh.onResults(onResults);
  
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null
      ) {
        camera = new cam.Camera(webcamRef.current.video, {
          onFrame: async () => {
            await faceMesh.send({ image: webcamRef.current.video });
          },
          width: width,
          height: height,
        });
        camera.start();
      }
      // else
      // faceMesh.close()

      return () => {
        stopCam();
      };
  }, []);

  const stopCam = () => {
    if (camera) {
      // camera.stop();
      console.log("FaceMesh camera stopped.");
      // webcamRef.current = null
      const mediaStream = webcamRef.current?.video?.srcObject;
    
      if (mediaStream) {
        const tracks = mediaStream.getTracks();
        
        tracks.forEach((track) => {
          track.stop();
          console.log(`Stopped track: ${track.label}`);
        });
      } else {
        console.log("MediaStream is not available.");
      }
    }
  };

  return (
    <div className="vidcam">
        {/* {showPopup && <div className="popup">No Cheating!</div>} */}
        <Webcam
          ref={webcamRef}
          height={height}
          width={width}
          mirrored={true}
          audio={false}
          videoConstraints={videoConstraints}
        />
        <Button onClick={stopCam}>Stop Camera</Button>
      </div>
  )
}

export default VideoRecorder