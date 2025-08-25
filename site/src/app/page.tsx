"use client"

import { Box, Button, Flex, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react";
import PerfilFoto from "site/components/perfilfoto";
import DefaultPage from "site/templates/defaultpage";
import { motion } from "motion/react";
import { use, useEffect, useState } from "react";
import { getScreenSize } from "site/utils/getscreensize";
import { isMobileScreen } from "site/utils/chackmobilescreen";
import RenderCardList from "site/components/card";
// import NextLink from "next/link";

export default function Home() {
  const [backx, setBackx] = useState(100);
  const isMobile = isMobileScreen();


  useEffect(() => {
    const interval = setInterval(() => {
      setBackx((backx + 1) % 720);
      console.log(isMobile);
    }, 10);
    return () => clearInterval(interval);
  }, [backx]);

  return (
    <DefaultPage id="home">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, type: "spring", stiffness: 80 }}
      >
        <Box 
          id="section-1"
          mx={0}  py={"8%"} px={"10%"}  
          bg={`linear-gradient(-${backx/2}deg, #00000000, #00a7da81, #00000000)`}
          _dark={{
            bg: `linear-gradient(-${backx/2}deg, #00000000, #0360ff81, #00000000)`,
          }}
          justifyItems={"center"}
        >

          <Flex direction={isMobile ? "column-reverse" : "row"}  gap={"20%"} maxW={"1000px"} > 
            <Box>
              <Heading size={"4xl"}  mb={0}> Ola! </Heading>
              <Heading size={"3xl"}  mb={0}> Bom dia, boa tarde e boa noite </Heading>
              <Heading size={"3xl"}  mb={5}> Eu me chamo Davi :) </Heading>

              <Text>Sou um desenvolvedor front-end em aprendizado,</Text>
              <Text>amante da tecnologia e da arte</Text>
            </Box>

            <PerfilFoto justifySelf={isMobile ? "center" : "auto"} m={isMobile ? 4 : 0}/>
          </Flex>

        </Box>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
      >
        <Box 
          id="section-2"
          mt={"50px"}mx={0}  py={"10%"} px={"10%"}  
          bg={``}
          _dark={{
            bg: ``,
          }}
         
        >

          <Box  maxW={"900px"}>
            <Heading mb={4}> Falando um pouquinho sobre mim </Heading>
            <Text> Sou técnico em informática e estudante de Ciência e Tecnologia na UFRN. Gosto de programar, desenhar e criar coisas novas — desde jogos estranhos e engraçados até projetos mais sérios em TI.</Text>
          </Box>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0.1, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
      >
        <Box 
          id="section-3"
          mt={"50px"}mx={0}  py={"5%"} px={"10%"}  
          bg={``}
          _dark={{
            bg: ``,
          }}
         
        >

          <Box maxW={"900px"}>
            <Heading mb={4}> Projetos </Heading>
            <RenderCardList projects={[
              {
                title: "Causa-Solidaria",
                description: "projeto de ajuda humanitária em desenvolvimento em conjunto com meus colegas do Grau Técnico.",
                image: "/icon_causa_solidaria.png",
                linkRun: "https://causa-solidaria.github.io/",
                linkRepo: "https://github.com/Causa-Solidaria/causa-solidaria.github.io"
              },
              {
                title: "jogo da vida de Conway",
                description: "Um jogo simples baseado na lógica de Conway.",
                image: "/image.png",
                linkRun: "https://pessoa736.github.io/lifegameConway-react/",
                linkRepo: "https://github.com/pessoa736/lifegameConway-react"
              }
            ]} />
          </Box>

        </Box>
      </motion.div>
    </DefaultPage>
  );
}
