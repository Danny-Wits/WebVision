import { AppShell, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useRef, useState } from "react";
import CameraPanel from "./components/CameraPanel";
import ControlPanel from "./components/ControlPanel";

export default function App() {
  const [activeMode, setActiveMode] = useState("emotion");
  // 1. Create the ref here
  const webcamRef = useRef(null);

  return (
    <AppShell
      header={{ height: { base: 60, md: 70 } }}
      padding="md"
      styles={{ main: { background: "#fdfdfd" } }}
    >
      <AppShell.Header
        p="md"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "3px solid rgb(255, 0, 0)",
        }}
      >
        <Stack gap={0}>
          <Title order={3} size="h4" c="red">
            AI INTERACTIVE HUB
          </Title>
          <Text size="xs" fw={700} c="dimmed" visibleFrom="sm">
            DEPT. OF COMPUTER SCIENCE | UNIVERSITY OF JAMMU
          </Text>
          <Text size="xs" fw={700} c="dimmed" hiddenFrom="sm">
            CS DEPT | JU
          </Text>
        </Stack>
      </AppShell.Header>

      <AppShell.Main>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <CameraPanel activeMode={activeMode} webcamRef={webcamRef} />

          <ControlPanel
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            webcamRef={webcamRef}
          />
        </SimpleGrid>
      </AppShell.Main>
    </AppShell>
  );
}
