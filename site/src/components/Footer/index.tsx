import { Box, Container, Text } from "@chakra-ui/react";
import FooterProps from "./footer.d";




export default function Footer({children, ...props}:FooterProps){
    return (
        <Box as="footer" py={10}>
            <Container>
                <Box>
                    {children}
                </Box>
                <Text 
                    fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }
                }>
                    © {new Date().getFullYear()} Davi Passos. Todos os direitos reservados.
                </Text>
                
            </Container>
        </Box>
    )
}