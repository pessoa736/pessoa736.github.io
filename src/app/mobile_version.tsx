"use client";
import { Box, Flex, Separator } from "@chakra-ui/react";
import Heading from "site/components/ui/heading";
import QuadradoSombreado from "site/components/ui/quadradoSonbreado";
import MobileTag from "site/components/tag/mobile";

// Simple vw-based helper tailored for phones (base ~ 430px)
const vw = (v: number, base: number = 430) => `calc(100vw * ${v}/${base})`;



export default function MobileHome() {
  return (
    <Box as="main" bg="#000" color="#fff" w="100vw" minH="100vh" position="relative" overflowX="hidden">
      <Flex
        as="header"
        position="sticky"
        top={0}
        left={0}
        zIndex={10}
        w="100vw"
        h={vw(56)}
        align="center"
        justify="center"
        bg="rgba(0,0,0,0.95)"
        borderBottom="1px solid #fff"
        backdropFilter={`blur(${vw(6)}) saturate(180%)`}
      >
        <Heading fontSize={vw(20)} fontWeight="600" textAlign="center">Sim! eu Faço Programa!</Heading>
      </Flex>

      <Flex direction="column" px={vw(16)} py={vw(16)} gap={vw(16)}>
        <Flex direction="column" align="center" gap={vw(12)}>
          <QuadradoSombreado
            bgImage={"url(/eu.jpg)"}
            bgPos="center"
            bgSize="cover"
            maxW={vw(160)}
            minW={vw(160)}
            maxH={vw(160)}
            minH={vw(160)}
            borderRadius={vw(16)}
            boxShadow={`${vw(-8)} ${vw(8)} 0 #fff`}
          />
          <Heading fontSize={vw(28)} fontWeight="700" textAlign="center" px={vw(6)}>
            Ola! Eu me chamo Davi :)
          </Heading>
          <Heading fontSize={vw(16)} fontWeight="300" textAlign="center" lineHeight="150%" f>
            Sou um desenvolvedor full‑stack web em aprendizado e um pequeno artista, amante da tecnologia e da arte.
          </Heading>
        </Flex>

        <Flex wrap="wrap" gap={vw(8)} justify="center">
          <MobileTag>Artista</MobileTag>
          <MobileTag>Estudante</MobileTag>
          <MobileTag>full-stack</MobileTag>
          <MobileTag>web developer</MobileTag>
          <MobileTag>Futuro Engenheiro da computação</MobileTag>
        </Flex>

        <Separator my={vw(16)} />

        <Flex direction="column" gap={vw(10)}>
          <Box bg="#fff" borderRadius={0} w="100%" h={vw(6)} />
          <Heading fontSize={vw(16)} fontWeight="300" lineHeight="160%" f>
            Tenho 19 anos, e sou do tipo de pessoa que gosta de criar projetos bem trabalhados e detalhados a nível técnico e artístico, principalmente quando mexe com algo novo ou diferente. Adoro resolver problemas e aprender no processo.
            <br /><br />
            Atualmente estou focado em aprender tecnologias web, principalmente React, Node.js, TypeScript e bancos de dados relacionais e não relacionais. Também estou estudando design de interfaces e experiência do usuário para criar aplicações mais intuitivas e agradáveis.
          </Heading>
          <Box bg="#fff" borderRadius={0} w="100%" h={vw(6)} />

          <Heading fontSize={vw(16)} fontWeight="300" mt={vw(6)} f>
            Linguagens que eu tenho domínio:
          </Heading>
          <Flex wrap="wrap" gap={vw(8)}>
            <MobileTag color="#264de4" textColor="#fff">TypeScript</MobileTag>
            <MobileTag color="#f7df1e" textColor="#000">JavaScript</MobileTag>
            <MobileTag color="#d98415" textColor="#fff">HTML</MobileTag>
            <MobileTag color="#61dbfb" textColor="#fff">JSX/TSX</MobileTag>
            <MobileTag color="#264de4" textColor="#fff">CSS</MobileTag>
            <MobileTag color="#300075" textColor="#fff">Lua</MobileTag>
          </Flex>

          <Heading fontSize={vw(16)} fontWeight="300" mt={vw(10)} f>
            Frameworks e bibliotecas que eu utilizo:
          </Heading>
          <Flex wrap="wrap" gap={vw(12)} justify="center">
            {["/react.jpg","/nodejs.png","/chakraui.png","/nextjs.png","/prisma.png","/jwt.png"].map((src, id) => (
              <QuadradoSombreado
                key={id}
                bgImage={`url(${src})`}
                bgPos="center"
                bgSize="cover"
                maxW={vw(56)}
                minW={vw(56)}
                maxH={vw(56)}
                minH={vw(56)}
                boxShadow={`${vw(-2)} ${vw(2)} 0 #fff`}
                transition="all 0.3s"
                _hover={{ boxShadow: `${vw(-6)} ${vw(6)} 0 #fff`, translate: `${vw(4)} ${vw(-4)}`, scale: 1.05, zIndex: 10 }}
              />
            ))}
          </Flex>
        </Flex>

        <Separator my={vw(20)} />

        <Flex direction="column" gap={vw(12)}>
          <Box bg="#fff" borderRadius={0} w="100%" h={vw(6)} />
          <Heading fontSize={vw(16)} fontWeight="300" lineHeight="160%" f>
            Sou estudante de ciência e tecnologia na ECT (Escola de Ciência e Tecnologia) na UFRN (Universidade Federal do Rio Grande do Norte), ingressei em 2025.2
          </Heading>
          <QuadradoSombreado
            bgImage={"url(/ect.jpg)"}
            bgPos="center"
            bgSize="cover"
            w="100%"
            minH={vw(200)}
          />
          <Box bg="#fff" borderRadius={0} w="100%" h={vw(6)} />
        </Flex>
      </Flex>
    </Box>
  );
}
