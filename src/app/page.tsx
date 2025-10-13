import { Box, Flex, Separator } from "@chakra-ui/react";
import AnimationBalls from "site/components/animationBalls";
import Saudacao from "site/components/saudacao";
import Tag from "site/components/tag";
import TemplatePage from "site/components/templatePage";
import Heading from "site/components/ui/heading";
import QuadradoSombreado from "site/components/ui/quadradoSonbreado";
import { staticPropotion } from "site/utils/staticPropotion";
export default function Home() {
  return (
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
      <Separator my={staticPropotion(20)} />
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
            Atualmente estou focado em aprender tecnologias web, principalmente React, Node.js, TypeScript e bancos de dados relacionais e não relacionais. Também estou estudando design de interfaces e experiência do usuário para criar aplicações mais intuitivas e agradáveis. 
          
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

        </Flex>
        <Separator orientation={"vertical"} mx={staticPropotion(40)}/>
        <Flex direction={"column"}>
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
            mt={staticPropotion(40)}
            bgImage={"url(/ect.jpg)"}
            bgPos={"center"}
            bgSize={"100%"}
            maxW={staticPropotion(628)}
            minW={staticPropotion(628)}
            maxH={staticPropotion(290)}
            minH={staticPropotion(290)}
          />
        </Flex>
      </Flex>
    </TemplatePage>
  );
}
