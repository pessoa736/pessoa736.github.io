"use client";
 
import { Box, Button, Grid, GridItem, Heading, Image, Text, Card as Cd, Link } from "@chakra-ui/react";
import { CardProps } from "./card.d";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { LuGithub, LuPlay } from "react-icons/lu";

const MotionCardRoot = motion(Cd.Root as any);

function StaticOpenCard({ card, onClose }: { card: CardProps; onClose: any }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !event.composedPath().includes(ref.current)) {
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
  <MotionCardRoot
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8, type: "ease"} }}
        exit={{ opacity: 0, y: 25, transition: { duration: 0.3 } }}
        ref={ref}
        borderWidth="1px"
        display="flex"
        flexDirection="column"
        borderRadius="lg"
        overflow="hidden"
        backdropFilter={"saturate(120%) blur(20px)"}
        bg={"rgba(255, 255, 255, 0.1)"}
        _dark={{ bg: "rgba(0,0,0, 0)" }}
        minH={"500px"}
        minW={"300px"}
        maxW={"500px"}
        zIndex={20}
      >
        <Cd.Body flex="1">  
          <Image
            w={"100%"}
            aspectRatio={1}
            borderRadius={"md"}
            src={card.image}
            alt={card.title}
          />
          <Box pt={4} px={4}>
            <Heading size="lg">{card.title}</Heading>
            <Text mt={3} mx={2}>
              {card.description}
            </Text>
          </Box>
        </Cd.Body>
        <Cd.Footer w={"100%"} >
          <Grid templateColumns="repeat(3, 1fr)" gap={1} w={"100%"} bottom={0} mt={4}>

            <GridItem colSpan={2} >
              <Link as={NextLink} href={card.linkRun} target="_blank" _hover={{ textDecoration: "none" }} w="100%" display="block">
                <Button colorScheme="blue" w={"100%"}>
                  <LuPlay />
                </Button>
              </Link>
            </GridItem>

            <GridItem colSpan={1}>
              <Link as={NextLink} href={card.linkRepo} target="_blank" _hover={{ textDecoration: "none" }} w="100%" display="block">
                <Button colorScheme="gray" w={"100%"}>
                  <LuGithub />
                </Button>
              </Link>
            </GridItem>
          </Grid>
        </Cd.Footer>
  </MotionCardRoot>
    </Box>
  );
}

const OpenCard = motion(StaticOpenCard);

function StaticCard({ title, description, image, linkRun, linkRepo }: CardProps) {
    const [opened, setOpened] = useState(false);


    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" onClick={() => setOpened(true)}>
            <Image w={"100%"} aspectRatio={4/3} src={image} alt={title}  />
            <Box p={4}>
                <Heading size="md">{title}</Heading>
                <Text mt={2}>{description}</Text>
            </Box>
            {opened && 
              <OpenCard 
                card={{ title, description, image, linkRun, linkRepo }} 
                onClose={() => setOpened(false)} 
              /> 
            }
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