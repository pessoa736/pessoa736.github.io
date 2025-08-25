import { Box, Container, Heading, HStack, Text } from "@chakra-ui/react";
import headerProps from "./header.d";
import NextLink from "next/link";
import { ColorModeButton } from "../ui/color-mode";
import { motion } from "motion/react";
import {motion as _motion} from "framer-motion";


 function StaticHeader({children, title, ...props}:headerProps){
    return (
        <Box 
            as="header" 
            position="sticky"
            width={"100%"} 
            top={0} zIndex={30} 
            bg="linear-gradient(-90deg, #fff5 10%, rgba(255, 255, 255, 0.65) 90%)" 
            _dark={{ bg: "linear-gradient(-90deg, #0005 10%, rgba(0, 0, 0, 0.56) 90%)"  }}
            backdropFilter="saturate(180%) blur(8px)" 
            borderBottomWidth="1px"
            py={4}
            {...props}
        >
            <Container display="flex" alignItems="center" justifyContent="space-between">
                <HStack  gap={3}>
                    <Heading size="xl">Davi a Pessoa {title && "· " + title}</Heading>
                </HStack>
            
                <HStack gap={4}>
                    <NextLink href="#sobre">Sobre mim</NextLink>
                    {/* <NextLink href="#habilidades">a</NextLink> */}
                    <NextLink href="#projetos">Projetos</NextLink>
                    <ColorModeButton aria-label="Alternar tema" />
                </HStack>
            </Container>
        </Box>
    )
}

const H = _motion(StaticHeader);

export default function Header({children, title} : headerProps){
    return (
        <H 
            title={title} 
            animate={{ opacity: 1, y: 0 }} 
            initial={{ opacity: 0, y: -20 }} 
            transition={{ duration: 1.2, type: "spring", stiffness: 130 }}
        >
            {children}
        </H>
    )
}