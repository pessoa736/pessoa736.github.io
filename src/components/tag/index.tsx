import { Box } from "@chakra-ui/react";
import Heading from "../ui/heading";
import { staticPropotion } from "site/utils/staticPropotion";



export default function Tag({children, color, textColor}: {children?: React.ReactNode, color?: string, textColor?: string}) {
    return (
        <Box
            maxH={staticPropotion(32)}
            minH={staticPropotion(32)}
            justifyContent={"center"}
            alignContent={"center"}
            px={staticPropotion(8)}
            borderRadius={staticPropotion(8)}
            bg={color}
            color={textColor}
            border={`${staticPropotion(1)} solid`}
        >
            <Heading 
                maxH={staticPropotion(16)}
                minH={staticPropotion(16)}
                fontSize={staticPropotion(16)}
                fontFamily={"sans-serif"}
            >{children}</Heading>
        </Box>
    );
}