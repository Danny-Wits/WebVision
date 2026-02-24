import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";

const ControlPanel = ({ activeMode, setActiveMode, webcamRef }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Helper function to convert Base64 image to a Blob for the API
  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleSnapshot = async () => {
    if (!webcamRef.current) return;

    // 1. Grab the image from the webcam
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsAnalyzing(true);
    setMatchResult(null);

    try {
      // 2. Convert and prepare payload
      const imageBlob = base64ToBlob(imageSrc);

      // 3. Send to Hugging Face
      const response = await fetch(
        "https://api-inference.huggingface.co/models/dima806/celebrity_image_detection",
        {
          headers: {
            Authorization: "Bearer YOUR_HUGGING_FACE_TOKEN", // Add your token here
            "Content-Type": "application/octet-stream",
          },
          method: "POST",
          body: imageBlob,
        },
      );

      const result = await response.json();

      // HF Image Classification returns an array of objects: [{ label: "Brad Pitt", score: 0.98 }, ...]
      if (result && result.length > 0) {
        setMatchResult(result[0]); // Grab the highest probability match
      } else {
        setMatchResult({ label: "Unknown", score: 0 });
      }
    } catch (error) {
      console.error("API Error:", error);
      setMatchResult({ error: "Failed to connect to AI server." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Paper shadow="sm" p="md" withBorder radius="md">
      <Stack justify="space-between" h="100%">
        <Stack>
          <Group justify="space-between">
            <Title order={5} c="dimmed">
              AI CONTROLS
            </Title>
            <Badge color="red" variant="filled">
              LIVE
            </Badge>
          </Group>
          <Divider my="sm" />
          <Button
            variant={activeMode === "emotion" ? "filled" : "light"}
            color="red"
            onClick={() => setActiveMode("emotion")}
            fullWidth
          >
            Real-time Emotion Detector
          </Button>
          <Button
            variant={activeMode === "celeb" ? "filled" : "light"}
            color="red"
            onClick={() => setActiveMode("celeb")}
            fullWidth
          >
            Celebrity Look-Alike
          </Button>
        </Stack>

        <Paper p="sm" bg="gray.0" radius="md" withBorder>
          <Text fw={700} size="sm">
            Current Logic:
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            {activeMode === "emotion"
              ? "Analyzing facial expressions locally using face-api.js..."
              : "Snapshot mode: Sending secure frame to Hugging Face Vision API..."}
          </Text>

          {activeMode === "celeb" && (
            <>
              <Button
                fullWidth
                color="dark"
                onClick={handleSnapshot}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader size="xs" color="white" />
                ) : (
                  "Take Snapshot"
                )}
              </Button>

              {/* Display Results */}
              {matchResult && !matchResult.error && (
                <Alert title="Match Found!" color="green" mt="md" radius="md">
                  <Text fw={700} size="lg">
                    {matchResult.label.toUpperCase()}
                  </Text>
                  <Text size="sm">
                    Confidence: {(matchResult.score * 100).toFixed(1)}%
                  </Text>
                </Alert>
              )}

              {matchResult?.error && (
                <Alert title="Error" color="red" mt="md" radius="md">
                  {matchResult.error}
                </Alert>
              )}
            </>
          )}
        </Paper>
      </Stack>
    </Paper>
  );
};

export default ControlPanel;
