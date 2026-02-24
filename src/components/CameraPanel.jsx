import { Center, Loader, Paper, Text, Title } from "@mantine/core";
import * as faceapi from "@vladmandic/face-api";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const CameraPanel = ({ activeMode, webcamRef }) => {
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Load the AI Models
  useEffect(() => {
    const loadModels = async () => {
      faceapi.tf.setBackend("webgl");
      await faceapi.tf.ready();
      console.log(
        `🟢 [Init] Engine Ready! Using backend: ${faceapi.tf.getBackend()}`,
      );
      console.log("🟡 [Init] Starting model loading from /models...");
      const MODEL_URL = "/models";

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("🟢 [Init] All 3 models loaded successfully!");
        setModelsLoaded(true);
      } catch (err) {
        console.error("🔴 [Init Error] Failed to load models:", err);
        setErrorMsg(
          `Model Load Error: Check console. Are files in public/models?`,
        );
      }
    };
    loadModels();
  }, []);

  // 2. The AI Detection Loop
  const handleVideoPlay = () => {
    console.log("🟡 [Camera] Webcam video started playing. Starting loop...");
    setInterval(async () => {
      // Check 1: Are we in the right mode?
      if (activeMode !== "emotion") {
        if (canvasRef.current) {
          canvasRef.current
            .getContext("2d")
            .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        return;
      }

      // Check 2: Does the webcam reference exist?
      if (!webcamRef.current) {
        console.log("🟠 [Loop] webcamRef is null. Waiting...");
        return;
      }

      // Check 3: Is the video data actually streaming?
      if (webcamRef.current.video.readyState !== 4) {
        console.log(
          `🟠 [Loop] Video readyState is ${webcamRef.current.video.readyState}, waiting for 4...`,
        );
        return;
      }

      // Execution: Try to find a face
      try {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize,
        );
        // Clear the previous frame's drawings
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- CUSTOM STYLISH DRAWING ---
        resizedDetections.forEach((detection) => {
          const box = detection.detection.box;
          const expressions = detection.expressions;

          // 1. Find the strongest emotion
          const dominantEmotion = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b,
          );

          // 2. Map emotions to vibrant "Cyber" colors
          const emotionColors = {
            happy: "#09ff00",
            sad: "#00BFFF",
            angry: "#FF3333",
            surprised: "#FF00FF",
            fearful: "#8A2BE2",
            disgusted: "#368336",
            neutral: "#e5e9e9",
          };
          const color = emotionColors[dominantEmotion] || "#FFFFFF";

          // 3. Draw a glowing, rounded bounding box
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.shadowColor = color;
          ctx.shadowBlur = 15; // Creates the neon glow effect

          ctx.beginPath();
          // roundRect makes the box look like a modern app instead of a terminal
          ctx.roundRect(box.x, box.y, box.width, box.height, 16);
          ctx.stroke();

          // 4. Draw a solid background badge for the text
          ctx.fillStyle = color;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          // Top-rounded corners only for the label tab
          ctx.roundRect(box.x, box.y - 35, 140, 30, [10, 10, 0, 0]);
          ctx.fill();

          // 5. Draw the stylish text inside the badge
          ctx.fillStyle = "#000000"; // Black text for high contrast
          ctx.font = 'bold 16px "Segoe UI", sans-serif';

          // Format text like "HAPPY 98%"
          const score = Math.round(expressions[dominantEmotion] * 100);
          const text = `${dominantEmotion.toUpperCase()} ${score}%`;
          ctx.fillText(text, box.x + 10, box.y - 12);
        });
        // ------------------------------
      } catch (err) {
        console.error("🔴 [Loop Error] Crash during face detection:", err);
      }
    }, 500);
  };

  return (
    <Paper shadow="sm" p="md" withBorder radius="md">
      <Title order={5} mb="sm" c="dimmed">
        LIVE FEED
      </Title>

      {errorMsg && (
        <Text c="red" fw={700} mb="sm">
          {errorMsg}
        </Text>
      )}

      {!modelsLoaded ? (
        <Center h={300}>
          <Loader color="red" type="bars" />
          <Text ml="md">Loading AI Models...</Text>
        </Center>
      ) : (
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            onPlay={handleVideoPlay}
            style={{ width: "100%", display: "block", borderRadius: "8px" }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 10,
            }}
          />
        </div>
      )}
    </Paper>
  );
};

export default CameraPanel;
