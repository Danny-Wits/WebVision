import { Client } from "@gradio/client";
import {
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import confetti from "canvas-confetti";
import { useState } from "react";

export default function CelebrityMatch({ webcamRef }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [userImage, setUserImage] = useState(null);

  const formatName = (name) =>
    name
      ?.replace(/_/g, " ")
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  // The fun part!
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b"],
    });
  };

  const handleSnapshot = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setUserImage(imageSrc);
    setIsAnalyzing(true);
    setMatchResult(null);

    try {
      const blob = await (await fetch(imageSrc)).blob();
      const app = await Client.connect("DannyWits/prism-celeb-vision");
      const result = await app.predict("/predict", [blob]);

      const topMatch = result?.data[0]?.confidences[0];

      setMatchResult({
        label: topMatch.label.toLowerCase(),
        score: topMatch.confidence,
      });

      // Fire the confetti on a successful match!
      triggerConfetti();
    } catch (err) {
      setMatchResult({ error: "Server busy. Try again. " + err });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Paper
      p="xl"
      shadow="md"
      radius="xl"
      withBorder
      bg="var(--mantine-color-gray-0)"
    >
      <Stack gap="lg">
        <Stack gap={4} align="center">
          <Title order={3} c="dark.8">
            Who is your Celebrity Twin?
          </Title>
          <Text size="sm" c="dimmed">
            Take a snap to find your Hollywood lookalike
          </Text>
        </Stack>

        <Button
          size="md"
          radius="xl"
          variant="gradient"
          gradient={{ from: "red ", to: "grape", deg: 90 }}
          onClick={handleSnapshot}
          disabled={isAnalyzing}
          style={{ transition: "transform 0.2s" }}
        >
          {isAnalyzing ? (
            <Group gap="sm">
              <Loader size="sm" color="white" />
              <Text size="md" fw={600}>
                Analyzing Face...
              </Text>
            </Group>
          ) : (
            "Find My Match ✨"
          )}
        </Button>

        {matchResult?.error && (
          <Alert color="red" radius="md" title="Oops!">
            {matchResult.error}
          </Alert>
        )}

        {matchResult && !matchResult.error && (
          <Stack gap="md" mt="sm">
            <Center>
              <Badge size="xl" variant="light" color="grape" radius="md">
                It's a {(matchResult.score * 100 + 20).toFixed(1)}% Match!
              </Badge>
            </Center>

            <Group grow align="flex-start" gap="md">
              <Stack gap="xs">
                <Text size="md" fw={700} ta="center" c="dark.7">
                  You
                </Text>
                <div style={imageContainerStyle}>
                  <img src={userImage} alt="User" style={imageStyle} />
                </div>
              </Stack>

              <Stack gap="xs">
                <Text size="md" fw={700} ta="center" c="dark.7">
                  {formatName(matchResult.label)}
                </Text>
                <div style={imageContainerStyle}>
                  <img
                    src={`celeb/${matchResult.label}.jpg`}
                    alt="Celebrity Match"
                    style={imageStyle}
                  />
                </div>
              </Stack>
            </Group>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

// Custom styles to keep images beautifully squared and uniformed
const imageContainerStyle = {
  width: "100%",
  aspectRatio: "1 / 1",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
  border: "3px solid white",
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover", // Prevents image stretching
  display: "block",
};
