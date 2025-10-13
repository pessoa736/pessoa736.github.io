import { Box, Flex } from "@chakra-ui/react";
import { staticPropotion } from "site/utils/staticPropotion";
import Heading from "../ui/heading";



export default function Header() {
    return (
        <Flex
            dir="row"
            as="header"
            maxW={"100vmax"}
            minW={"100vmax"}
            maxH={staticPropotion(50)}
            minH={staticPropotion(50)}
            position={"fixed"}
            backdropFilter={`blur(${staticPropotion(10)}) saturate(180%)`}
            top={0}
            left={0}
            zIndex={10}
            bg={"rgba(0,0,0,0.95)"}
            borderBottom={"1px solid #fff"}
            justifyContent={"space-between"}
            alignItems={"center"}
            boxShadow={`${staticPropotion(0)} ${staticPropotion(15)} ${staticPropotion(15)} rgba(0,0,0,0.4)`}
        >
            <Box
                maxW={staticPropotion(200)}
                minW={staticPropotion(200)}   
                maxH={"100%"}
                minH={"100%"}
            >
                <Heading 
                    fontSize={staticPropotion(24)} 
                    minW={staticPropotion(200)} 
                    maxW={staticPropotion(200)}
                    textAlign={"center"}
                > Sim! eu Faço Programa! </Heading>
            </Box>
        </Flex>
    );
}