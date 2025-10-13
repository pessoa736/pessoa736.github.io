import { Flex, Grid, HStack, Separator, Stack, VStack } from "@chakra-ui/react";
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
      <Separator mt={staticPropotion(20)}/>
    </TemplatePage>
  );
}
