import {
  Badge,
  Box,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import * as faceapi from "@vladmandic/face-api";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const CameraPanel = ({ activeMode, webcamRef }) => {
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      try {
        faceapi.tf.setBackend("webgl");
        await faceapi.tf.ready();
        const MODEL_URL = "/models";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        setErrorMsg("Model Load Error: Check public/models folder." + err);
      }
    };
    loadModels();
  }, []);

  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (
        activeMode !== "emotion" ||
        !webcamRef.current ||
        webcamRef.current.video.readyState !== 4
      ) {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
        }
        return;
      }

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
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        resizedDetections.forEach((detection) => {
          const box = detection.detection.box;
          const expressions = detection.expressions;
          const dominantEmotion = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b,
          );

          const emotionColors = {
            happy: "#4ade80",
            sad: "#60a5fa",
            angry: "#f87171",
            surprised: "#f472b6",
            fearful: "#a78bfa",
            disgusted: "#fb923c",
            neutral: "#94a3b8",
          };
          const color = emotionColors[dominantEmotion] || "#ffffff";

          // Stylish Rounded Box with Glow
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.roundRect(box.x, box.y, box.width, box.height, 12);
          ctx.stroke();

          // Label Badge
          ctx.shadowBlur = 0;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(box.x, box.y - 35, 120, 30, 8);
          ctx.fill();

          // Text
          ctx.fillStyle = "#ffffff";
          ctx.font = 'bold 14px "Inter", sans-serif';
          const score = Math.round(expressions[dominantEmotion] * 100);
          ctx.fillText(
            `${dominantEmotion.toUpperCase()} ${score}%`,
            box.x + 10,
            box.y - 15,
          );
        });
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, 500); // Faster refresh for smoother tracking

    return () => clearInterval(interval);
  };

  return (
    <Paper
      shadow="md"
      p={{ base: "md", sm: "xl" }}
      withBorder
      radius="lg"
      bg="white"
    >
      <Group justify="space-between" mb="md">
        <Stack gap={0}>
          <Title order={4} c="dark.7">
            Vision Monitor
          </Title>
          <Text size="xs" c="dimmed" fw={500}>
            Neural Engine Active
          </Text>
          <Text size="xs" c="dimmed" fw={500} mt="xs">
            Please look directly into the camera lens and show an expression.
          </Text>
        </Stack>
        {modelsLoaded && (
          <Badge
            variant="dot"
            color="red"
            size="lg"
            styles={{ root: { animation: "pulse 2s infinite" } }}
          >
            LIVE
          </Badge>
        )}
      </Group>

      {errorMsg && (
        <Paper
          p="xs"
          bg="red.0"
          mb="md"
          withBorder
          style={{ borderColor: "var(--mantine-color-red-2)" }}
        >
          <Text c="red.7" size="sm" fw={600} ta="center">
            {errorMsg}
          </Text>
        </Paper>
      )}

      <Box
        pos="relative"
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#000",
        }}
      >
        {!modelsLoaded ? (
          <Center h={400} style={{ flexDirection: "column", gap: "15px" }}>
            <Loader color="red.6" size="lg" />
            <Text c="dimmed" size="sm" fw={600}>
              Initializing AI Models...
            </Text>
          </Center>
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              onPlay={handleVideoPlay}
              style={{ width: "100%", display: "block" }}
              videoConstraints={{ facingMode: "user" }}
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
                pointerEvents: "none", // Allows clicks to pass through if needed
              }}
            />
          </>
        )}
      </Box>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `,
        }}
      />
    </Paper>
  );
};

export default CameraPanel;
