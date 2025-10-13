import { Box } from "@chakra-ui/react";
import { staticPropotion } from "site/utils/staticPropotion";




export default function Timeline({children}: {children?: React.ReactNode}) {
    return (
        <Box mx={staticPropotion(45)} w={"100%"} overflowX={"hidden"}>
            {children}
        </Box>
    );
}