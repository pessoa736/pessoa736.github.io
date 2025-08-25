import { Box, Heading, Image, Text } from "@chakra-ui/react";
import { CardProps } from "./card.d";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function OpenCard({ card, onClose }: { card: CardProps; onClose: any }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box
      pos={"fixed"}
      top={0}
      left={0}
      width={"100%"}
      height={"100%"}
      bg={"rgba(255, 255, 255, 0.3)"}
      _dark={{ bg: "rgba(0,0,0, 0.7)" }}
      zIndex={10}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        ref={ref} // <<< ref aqui dentro, não no overlay
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        backdropFilter={"blur(15px)"}
        bg={"rgba(255, 255, 255, 0.4)"}
        _dark={{ bg: "rgba(0,0,0, 0.7)" } }
        width={["80%", "70%", "50%"]}
        height={"80%"}
        maxW={"500px"}
        zIndex={20}
      >
        <Image
          w={"100%"}
          aspectRatio={4/3}
          borderRadius={"md"}
          src={card.image}
          alt={card.title}
        />
        <Box p={4}>
          <Heading size="lg">{card.title}</Heading>
          <Text mt={3} mx={2}>
            {card.description}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}


function StaticCard({ title, description, image, linkRun, linkRepo }: CardProps) {
    const [opened, setOpened] = useState(false);

    function handleExitCardOpened() {
        setOpened(false);
    }

    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" onClick={() => setOpened(true)}>
            <Image w={"100%"} aspectRatio={4/3} src={image} alt={title}  />
            <Box p={4}>
                <Heading size="md">{title}</Heading>
                <Text mt={2}>{description}</Text>
            </Box>
            {opened ? <OpenCard card={{ title, description, image, linkRun, linkRepo }} onClose={handleExitCardOpened} /> : null}
        </Box>
    );
}

const C = motion(StaticCard);

export function Card(props: CardProps) {
  return (
        <C
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            {...props}
        />
    );
}


export default function RenderCardList({ projects }: { projects: CardProps[] }) {
  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
      {projects.map((project, idx) => (
        <Card key={idx} {...project} />
      ))}
    </Box>
  );
}