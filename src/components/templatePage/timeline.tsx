import { Box } from "@chakra-ui/react";




export default function Timeline({children}: {children?: React.ReactNode}) {
    return (
        <Box mx={"calc(100vmax * 45/1300)"} my={"calc(100vmax * 30/700)"} overflowX={"hidden"}>
            {children}
        </Box>
    );
}