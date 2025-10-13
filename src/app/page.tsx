"use client";
import { Box, Flex, Separator } from "@chakra-ui/react";
import AnimationBalls from "site/components/animationBalls";
import Saudacao from "site/components/saudacao";
import Tag from "site/components/tag";
import TemplatePage from "site/components/templatePage";
import Heading from "site/components/ui/heading";
import QuadradoSombreado from "site/components/ui/quadradoSonbreado";
import { useIsMobile } from "site/utils/isMobile";
import { staticPropotion } from "site/utils/staticPropotion";
import MobileHome from "./mobile_version";



export default function Home() {
  const isMobile = useIsMobile(true);
  return isMobile ? (
    <MobileHome />
  ) : (
    <TemplatePage>
      <Flex direction={"row"} mt={staticPropotion(100)}>
        <Flex direction={"column"}>
            <Flex direction={"row"} w={staticPropotion(605)}>
              <Saudacao />
              <QuadradoSombreado 
                borderRadius={staticPropotion(24)}
                marginLeft={staticPropotion(20)}
                minW={staticPropotion(285)} maxWidth={staticPropotion(285)} 
                minH={staticPropotion(285)} maxHeight={staticPropotion(285)}
                bgImage={"url(/eu.jpg)"}
                bgPos={"center"}
                bgSize={"100%"} 
                boxShadow={`${staticPropotion(-17)} ${staticPropotion(16)} 0 #fff`}
              />
            </Flex>
            <Heading
              fontSize={staticPropotion(32)}
              fontWeight={"300"}
              mt={staticPropotion(30)}
              w={staticPropotion(600)}
              f
            >
              Sou um desenvolvedor full-stack web em aprendizado e um pequeno artista, amante da tecnologia e da arte.
            </Heading>
            <Flex
              direction={"row"}
              minW={staticPropotion(600)} 
              maxW={staticPropotion(600)} 
              mt={staticPropotion(20)} 
              gap={staticPropotion(5)}
            > 
              <Tag>Artista</Tag>
              <Tag>Estudante</Tag>
              <Tag>full-stack</Tag>
              <Tag>web developer</Tag>
            </Flex>
            <Flex
              direction={"row"}
              minW={staticPropotion(600)} 
              maxW={staticPropotion(600)} 
              mt={staticPropotion(5)} 
              gap={staticPropotion(5)}
            > 
            <Tag>Futuro Engenheiro da computação</Tag> 
            </Flex>
        </Flex>
        <AnimationBalls 
          ml={staticPropotion(20)}
          w={staticPropotion(620)}
          h={staticPropotion(475)} 
        />
      </Flex>
      <Separator my={staticPropotion(20)} w={staticPropotion(1210)}/>
      <Flex direction={"row"}>
        <Flex direction={"column"}>
          <Box 
            bg="#fff" 
            borderRadius={0}
            maxW={staticPropotion(482)}
            minW={staticPropotion(482)}
            maxH={staticPropotion(13)}
            minH={staticPropotion(13)}
          />
          <Heading
            fontSize={staticPropotion(20)}
            fontWeight={"100"}
            mt={staticPropotion(30)}
            w={staticPropotion(482)}
            lineHeight={"150%"}
          >
            Tenho  19 anos, e sou do tipo de  pessoa que gosta criar projetos bem trabalhados e detalhados a nivel tecnico e artistico, principalmente quando mexe com algo novo ou diferente.  Adoro resolver problemas e aprender no processo.<br /><br />
            Atualmente estou focado em aprender tecnologias web, principalmente React, Node.js, TypeScript e bancos de dados relacionais e não relacionais. Também estou estudando design de interfaces e experiência do usuário para criar aplicações mais intuitivas e agradáveis.<br /><br />
          
          </Heading>
          
          <Box
            mt={staticPropotion(20)} 
            bg="#fff" 
            borderRadius={0}
            maxW={staticPropotion(482)}
            minW={staticPropotion(482)}
            maxH={staticPropotion(13)}
            minH={staticPropotion(13)}
          />

          <Heading
            fontSize={staticPropotion(20)}
            fontWeight={"100"}
            mt={staticPropotion(30)}
            w={staticPropotion(482)}
            lineHeight={"150%"}
          >
            Linguagens que eu tenho dominio: 
          </Heading>
          <Flex mt={staticPropotion(5)} gapX={staticPropotion(5)}>
            <Tag color="#264de4" textColor="#fff">TypeScript</Tag>
            <Tag color="#f7df1e" textColor="#000">JavaScript</Tag>
            <Tag color={"#d98415"} textColor="#fff">HTML</Tag>
            <Tag color={"#61dbfb"} textColor="#fff">JSX/TSX</Tag>
            <Tag color="#264de4" textColor="#fff">CSS</Tag>
            <Tag color="#300075" textColor="#fff">Lua</Tag>
          </Flex>

          <Heading
            fontSize={staticPropotion(20)}
            fontWeight={"100"}
            mt={staticPropotion(20)}
            w={staticPropotion(482)}
            lineHeight={"150%"}
          >
            Frameworks e bibliotecas que eu utilizo: 
          </Heading>
          <Flex mt={staticPropotion(5)} gapX={staticPropotion(15)} pl={staticPropotion(10)}>
            {[
              {bgImage: "url(/react.jpg)"},
              {bgImage: "url(/nodejs.png)"},
              {bgImage: "url(/chakraui.png)"},
              {bgImage: "url(/nextjs.png)"},
              {bgImage: "url(/prisma.png)"},
              {bgImage: "url(/jwt.png)"},
            ].map((_, id) => (
              <QuadradoSombreado 
                key={id} 
                maxWidth={staticPropotion(65)}
                minW={staticPropotion(65)}
                maxH={staticPropotion(65)}
                minH={staticPropotion(65)}
                boxShadow={`${staticPropotion(-2)} ${staticPropotion(2)} 0 #fff`}
                transition={"all 0.5s "}
                _hover={{
                  boxShadow: `${staticPropotion(-10)} ${staticPropotion(10)} 0 #fff`,
                  translate: `${staticPropotion(8)} ${staticPropotion(-8)}`,
                  scale: 1.1,
                  zIndex: 10
                }}
              />
            ))}
          </Flex>
        </Flex>
        <Separator orientation={"vertical"} mx={staticPropotion(40)}/>
        <Flex direction={"column"}>
          <Box
            mb={staticPropotion(20)} 
            bg="#fff" 
            borderRadius={0}
            maxW={staticPropotion(628)}
            minW={staticPropotion(628)}
            maxH={staticPropotion(13)}
            minH={staticPropotion(13)}
          />
          <Heading 
            fontSize={staticPropotion(20)}
            fontWeight={"100"}
            mt={staticPropotion(0)}
            w={staticPropotion(628)}
            lineHeight={"150%"}
          >
            Sou estudante de ciencia e tecnologia na  ECT (escola de ciência e tecnologia) na  UFRN ( Universidade Federal do Rio Grande Do Norte), ingressei em 2025.2
          </Heading>
          <QuadradoSombreado 
            mt={staticPropotion(30)}
            bgImage={"url(/ect.jpg)"}
            bgPos={"center"}
            bgSize={"100%"}
            maxW={staticPropotion(628)}
            minW={staticPropotion(628)}
            maxH={staticPropotion(290)}
            minH={staticPropotion(290)}
          />
          <Box
            mt={staticPropotion(30)} 
            bg="#fff" 
            borderRadius={0}
            maxW={staticPropotion(628)}
            minW={staticPropotion(628)}
            maxH={staticPropotion(13)}
            minH={staticPropotion(13)}
          />
        </Flex>
      </Flex>
    </TemplatePage>
  );
}
