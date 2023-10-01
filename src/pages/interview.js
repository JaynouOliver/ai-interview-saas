import Head from "next/head";
import { subDays, subHours } from "date-fns";
import {
  Box,
  Button,
  Container,
  Unstable_Grid2 as Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { OverviewBudget } from "src/sections/overview/overview-budget";
import { OverviewLatestOrders } from "src/sections/overview/overview-latest-orders";
import { OverviewLatestProducts } from "src/sections/overview/overview-latest-products";
import { OverviewSales } from "src/sections/overview/overview-sales";
import { OverviewTasksProgress } from "src/sections/overview/overview-tasks-progress";
import { OverviewTotalCustomers } from "src/sections/overview/overview-total-customers";
import { OverviewTotalProfit } from "src/sections/overview/overview-total-profit";
import { OverviewTraffic } from "src/sections/overview/overview-traffic";
import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from "@mui/material";
import {
  MdMic,
  MdMicOff,
  MdModeStandby,
  MdStart,
  MdVideocam,
  MdVideocamOff,
  MdArrowCircleRight,
  MdDesktopWindows,
} from "react-icons/md";
import useIsTabVisible from "src/hooks/use-istabvisible";
import React, { useEffect, useState, useRef } from "react";
import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";
// import VideoRecorder from "src/components/videorecorder";
import dynamic from 'next/dynamic';

const VideoRecorder = dynamic(() => import('../components/videorecorder'), {
  ssr: false,  // This will load the component only on the client side
  loading: () => <p>Loading...</p>  // Optional loading component
});

import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

import api from "src/pages/api";
import { useAuth } from "src/hooks/use-auth";

const Page = () => {
  // const isTab = useIsTabVisible()
  const isTabVisible = useIsTabVisible();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);

  const [startInterview, setStartInterview] = useState(false);
  const [isCameraOn, setCameraOn] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recording, setRecording] = useState(false);
  // const [mediaRecorder, setMediaRecorder] = useState(null);
  const mediaRecorder = useRef(null);
  const videoCamRef = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [answers, setAnswers] = useState(new FormData());
  const [questions, setQuestions] = useState([]);
  const [currentQues, setCurrentQues] = useState("");
  const [isCheating, setIsCheating] = useState(false);

  const { user, updateUser } = useAuth();

  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.table(err) // onNotAllowedOrFound
  );

  useEffect(() => {
    if (!recorderControls.isRecording && recorderControls.recordingBlob) {
      console.log("Recording blob:", recorderControls.recordingBlob);
      // setAudioChunks(prev => [...prev, recorderControls.recordingBlob]);
      const audioFileName = `voice-${currentQues.id}.wav`;
      const audioFile = new File([recorderControls.recordingBlob], audioFileName, {
        type: "audio/wav",
      });

      if (answers.has(audioFileName)) answers.set(audioFileName, audioFile);
      else answers.append(audioFileName, audioFile);
    }
  }, [recorderControls.isRecording, recorderControls.recordingBlob]);

  useEffect(() => {
    if (!isTabVisible) {
      setSnackbarOpen(true);
    }
  }, [isTabVisible]);

  useEffect(() => {
    const getQs = async () => {
      const q = await api.get("/get-questions");
      if (q.status === 200) setQuestions(q.data);
    };

    getQs();
  }, []);

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [unsavedChanges]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };


  const handleRecordClick = async () => {
    if (recorderControls.isRecording) {
      recorderControls.stopRecording();
    } else {
      console.log("started");
      // setAudioChunks([])
      recorderControls.startRecording();
    }

    // console.log("rec stopped", blob);
    // setAudioChunks((prevChunks) => [...prevChunks, blob]);
  };

  const handleInterviewStartStop = async () => {
    if (startInterview && unsavedChanges) {
      const userConfirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to stop the interview and lose your changes?"
      );

      if (!userConfirmed) {
        return;
      }
    }

    setCurrentQues(startInterview ? "" : questions[0]);

    setStartInterview(!startInterview);
    setShowPopUp(!showPopUp);
    setCameraOn(!isCameraOn);
    setSubmitted(false);

    console.log(questions);
    console.log(currentQues);

    // if(startInterview){
    //   setCurrentQues("");
    //   return;
    // }
  };

  const handleSubmitInterview = async () => {
    alert("sure?");

    for(let i of answers.values())
        console.log(i)

    answers.append("user_id", user.id)

    try {
      setLoading(true)
      const response = await api.post("/submit-answers", answers, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("res", response);

      if (response.status === 200) {
        console.log("Audio sent successfully");
        console.log(response.data)
        updateUser(response.data.result)
      } else {
        console.error("Failed to send audio");
      }
    } catch (error) {
      console.error("Error sending audio:", error);
    }

    console.log(answers)

    setLoading(false);
    setSubmitted(true);
    setStartInterview(false);
    setCameraOn(false);

    // videoCamRef.current.stopCam();
  };

  const handleNextQuestion = () => {
    const newIdx = questions.indexOf(currentQues) + 1;

    if (!startInterview) {
      alert("Start");
      return;
    }
    if (newIdx === questions.length) {
      alert("Done!");
      // setShowPopUp(true);
      // setStartInterview(!startInterview);
      setCurrentQues({ question: "Interview Done! Click on Submit!" });
      console.log("ans", answers);
      return;
    }

    setCurrentQues(questions[newIdx]);
  };

  return (
    <>
      <Head>
        <title>{isTabVisible ? "Interview" : "Tab Changed"} | Interview App</title>
        {/* <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0">
</script> */}
      </Head>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        {/* {isTabVisible && ( */}
        <Snackbar
          open={isTabVisible && snackbarOpen}
          autoHideDuration={6000}
          onClose={handleClose}
          key="topcenter1"
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="warning" onClose={handleClose} sx={{ width: "100%" }}>
            Tab change detected! This may be considered as cheating.
          </Alert>
        </Snackbar>
        {/* )} */}

        {/* {isCheating && ( */}
        <Snackbar
          open={isCheating}
          autoHideDuration={6000}
          onClose={handleClose}
          key="topcenter2"
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="warning" onClose={handleClose} sx={{ width: "100%" }}>
            Cheating detected! Do not move.
          </Alert>
        </Snackbar>
        {/* )} */}

        <Dialog open={showPopUp}>
          <DialogTitle>
            Are you sure you want to {startInterview ? "stop" : "start"} the interview?
          </DialogTitle>
          <Button onClick={handleInterviewStartStop} color="primary">
            Yes
          </Button>
          <Button
            onClick={() => {
              setShowPopUp(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
        </Dialog>

        <Container maxWidth="xl">
          <Grid
            container
            spacing={3}
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            {isLoading && <CircularProgress />}

            <Grid item>
              {/* <Box sx={{ height: "100%", border: 1, borderColor: "black" }}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt debitis possimus
                temporibus repellendus nostrum tempore, quasi sed et quae commodi. Iste cum at
                officia qui corrupti corporis maxime aspernatur. Ullam.
              </Box> */}
              {/* <Card sx={{ height: '55vh' }}>
              <CardContent></CardContent>
            </Card> */}

              {/* <VideoRecorder
          onRecordingComplete={(videoBlob) => {
            // Do something with the video...
            console.log('videoBlob', videoBlob)
          }}
        /> */}

              {isCameraOn ? (
                // <VideoRecorder height={500} width={500} setSnackbarOpen={setIsCheating} ref={videoCamRef}/>
                <VideoRecorder height={500} width={500} setSnackbarOpen={setIsCheating} />
                // "hi"
              ) : (
                <Card sx={{ height: "55vh", width: "80vw" }}>
                  <CardContent></CardContent>
                </Card>
              )}

              {/* { isCameraOn && <VideoRecorder height={500} width={500} setSnackbarOpen={setIsCheating}/> } */}
            </Grid>
            <Grid item lg={12}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, alias!
                  Quidem illo assumenda beatae deserunt rem quibusdam quis architecto distinctio
                  corporis dolor obcaecati nemo libero totam aliquid, aut consectetur dignissimos. */}
                  {currentQues ? currentQues["question"] : "Start the Interview!"}
                </CardContent>
              </Card>
            </Grid>
            <Grid item sx={{ "& button": { fontSize: 32, minWidth: 32, minHeight: 32 } }}>
              <Button
                onClick={() => {
                  setShowPopUp(true);
                }}
              >
                {startInterview ? <MdModeStandby /> : <MdStart />}
              </Button>

              <Button
                onClick={() => {
                  setCameraOn(!isCameraOn);
                }}
              >
                {isCameraOn ? <MdVideocamOff /> : <MdVideocam />}
              </Button>

              <Button onClick={handleRecordClick}>
                {recorderControls.isRecording ? <MdMicOff /> : <MdMic />}
              </Button>

              <Button onClick={handleNextQuestion}>
                <MdArrowCircleRight />
              </Button>

              <Button
                onClick={handleSubmitInterview}
                sx={{ marginRight: "5px" }}
                disabled={submitted}
              >
                <MdDesktopWindows />
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
