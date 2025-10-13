import { Box, BoxProps } from "@chakra-ui/react";
import { staticPropotion } from "site/utils/staticPropotion";



export default function QuadradoSombreado({children, ...props }: {children?: React.ReactNode} & BoxProps) {
    return (
    <Box
        overflow={"hidden"}
        boxShadow={`${staticPropotion(-10)} ${staticPropotion(10)} 0 #ffffff`}
        borderRadius={staticPropotion(10)}
        border={`${staticPropotion(2)} solid`}
        borderColor={"#ffffff"}
        {...props}
    >{children}</Box>);
}