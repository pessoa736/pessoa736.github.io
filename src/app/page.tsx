import { Flex,  } from "@chakra-ui/react";
import AnimationBalls from "site/components/animationBalls";
import Saudacao from "site/components/saudacao";
import TemplatePage from "site/components/templatePage";
import Heading from "site/components/ui/heading";
import QuadradoSombreado from "site/components/ui/quadradoSonbreado";


export default function Home() {
  return (
    <TemplatePage>
      <Flex direction={"row"}>
        <Flex direction={"column"}>
            <Flex direction={"row"} w={"calc(100vmax * 605/1300)"}>
              <Saudacao />
              <QuadradoSombreado 
                borderRadius={"calc(100vmax * 24/1300)"}
                marginLeft={"calc(100vmax * 20/1300)"}
                minW={"calc(100vmax * 285/1300)"} maxWidth={"calc(100vmax * 285/1300)"} 
                minH={"calc(100vmax * 285/1300)"} maxHeight={"calc(100vmax * 285/1300)"}
                bgImage={"url(/eu.jpg)"}
                bgPos={"center"}
                bgSize={"100%"} 
              />
            </Flex>
            <Heading
              fontSize={"calc(100vmax * 32/1300)"}
              fontWeight={"300"}
              mt={"calc(100vmax * 20/1300)"}
              w={"calc(100vmax * 600/1300)"}
              f
            >
              Sou um desenvolvedor full-stack web em aprendizado e um pequeno artista, amante da tecnologia e da arte.
            </Heading>
        </Flex>
        <AnimationBalls 
          ml={"calc(100vmax * 20/1300)"}
          w={"calc(100vmax * 620/1300)"}
          h={"calc(100vmax * 475/1300)"} 
        />
      </Flex>

    </TemplatePage>
  );
}
