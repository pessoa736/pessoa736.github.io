import { Box, BoxProps } from "@chakra-ui/react";



export default function QuadradoSombreado({children, ...props }: {children?: React.ReactNode} & BoxProps) {
    return (
    <Box
        overflow={"hidden"}
        boxShadow="calc(100vmax * -10/1300) calc(100vmax * 10/1300) 0 #ffffff"
        borderRadius={"calc(100vmax * 10/1300)"}
        border={"calc(100vmax * 2/1300) solid"}
        borderColor={"#ffffff"}
        {...props}
    >{children}</Box>);
}