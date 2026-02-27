import {
  ActionIcon,
  AppShell,
  Badge,
  Flex,
  Group,
  List,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCheck, IconCode, IconInfoCircle } from "@tabler/icons-react";
import { useRef, useState } from "react";
import CameraPanel from "./components/CameraPanel";
import ControlPanel from "./components/ControlPanel";

export default function App() {
  const [activeMode, setActiveMode] = useState("emotion");
  const [isAboutOpen, setIsAboutOpen] = useState(false); // Modal state
  const webcamRef = useRef(null);

  return (
    <>
      {/* The Global About Modal */}
      <Modal
        opened={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title={
          <Group gap="sm">
            <IconCode size={24} color="var(--mantine-color-pink-6)" />
            <Title order={4}>About AI Interactive Hub</Title>
          </Group>
        }
        centered
        overlayProps={{ blur: 3 }}
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Developed by the Department of Computer Science, University of
            Jammu. This interactive application demonstrates real-time computer
            vision and custom-trained machine learning models directly in the
            browser.
          </Text>

          <Title order={6} mt="sm">
            Under the Hood:
          </Title>
          <List
            spacing="sm"
            size="sm"
            center
            icon={
              <ThemeIcon color="pink.6" size={24} radius="xl">
                <IconCheck size={16} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>Frontend:</b> React, Vite, and Mantine UI for a responsive
              architecture.
            </List.Item>
            <List.Item>
              <b>Facial Analysis:</b> face-api.js for real-time face detection
              and 68-point landmark extraction.
            </List.Item>
            <List.Item>
              <b>Custom Model:</b> Fine-tuned Vision Transformer
              (ViT-base-patch16-224) trained via Hugging Face.
            </List.Item>
            <List.Item>
              <b>Dynamic Data:</b> MediaWiki API integration for real-time
              dataset augmentation.
            </List.Item>
          </List>
        </Stack>
      </Modal>

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

          {/* New Info Trigger Button */}
          <ActionIcon
            variant="light"
            color="pink"
            size="lg"
            radius="xl"
            onClick={() => setIsAboutOpen(true)}
            title="About This Project"
          >
            <IconInfoCircle size={22} />
          </ActionIcon>
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
    </>
  );
}
