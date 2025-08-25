import { Box, BoxProps } from "@chakra-ui/react";
import Footer from "site/components/Footer";
import Header from "site/components/Header";


export default function DefaultPage({children, background, ...props}: {children?: React.ReactNode, background?: string} & BoxProps) {
    return (
        <Box height={"100vh"} bg={background}>
            <Header />

                <Box {...props}>
                    {children}
                </Box>

            <Footer />
        </Box>
    );
}
