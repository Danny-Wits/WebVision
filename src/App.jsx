import {
  AppShell,
  Badge,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useRef, useState } from "react";
import CameraPanel from "./components/CameraPanel";
import ControlPanel from "./components/ControlPanel";

export default function App() {
  const [activeMode, setActiveMode] = useState("emotion");
  const webcamRef = useRef(null);

  return (
    <AppShell
      header={{ height: { base: 60, md: 70 } }}
      footer={{ height: { base: 90, sm: 60 } }}
      padding="xl"
      styles={{
        main: {
          backgroundColor: "var(--mantine-color-gray-0)",
          minHeight: "100vh",
        },
      }}
    >
      <AppShell.Header
        withBorder
        shadow="sm"
        px="md"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Stack gap={2}>
          <Title
            order={1}
            size="h3"
            variant="gradient"
            gradient={{ from: "red.7", to: "pink.6", deg: 90 }}
            style={{ letterSpacing: "1px" }}
          >
            AI INTERACTIVE HUB
          </Title>
          <Text c="red" size="xs" fw={700} visibleFrom="sm" tt="uppercase">
            Dept. of Computer Science | University of Jammu
          </Text>
          <Text size="xs" fw={700} c="dimmed" hiddenFrom="sm" tt="uppercase">
            CS Dept | JU
          </Text>
        </Stack>
      </AppShell.Header>

      <AppShell.Main px={"sm"}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <CameraPanel activeMode={activeMode} webcamRef={webcamRef} />

          <ControlPanel
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            webcamRef={webcamRef}
          />
        </SimpleGrid>
      </AppShell.Main>

      <AppShell.Footer
        withBorder
        p="sm"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "xs", sm: "md" }}
          justify={{ base: "center", sm: "space-between" }}
          align="center"
          h="100%"
          w="100%"
          px="md"
        >
          <Text size="xs" fw={600} c="dimmed" ta="center">
            © {new Date().getFullYear()} Department of Computer Science,
            University of Jammu
          </Text>

          <Group gap="xs" justify="center">
            <Text
              size="xs"
              c="dimmed"
              fw={600}
              mr="xs"
              display={{ base: "none", sm: "inline-block" }}
              tt="uppercase"
              letterSpacing="0.5px"
            >
              Powered By:
            </Text>
            <Badge size="sm" variant="light" color="blue" radius="xl">
              React
            </Badge>
            <Badge size="sm" variant="light" color="yellow" radius="xl">
              Vite
            </Badge>
            <Badge size="sm" variant="light" color="red" radius="xl">
              face-api.js
            </Badge>
            <Badge size="sm" variant="light" color="grape" radius="xl">
              HF
            </Badge>
            <Badge size="sm" variant="light" color="cyan" radius="xl">
              Mantine
            </Badge>
          </Group>
        </Flex>
      </AppShell.Footer>
    </AppShell>
  );
}
