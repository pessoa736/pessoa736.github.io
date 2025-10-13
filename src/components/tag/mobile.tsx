import { Box } from "@chakra-ui/react";
import Heading from "../ui/heading";

const vw = (v: number, base: number = 430) => `calc(100vw * ${v}/${base})`;

export default function MobileTag({
  children,
  color,
  textColor,
}: {
  children?: React.ReactNode;
  color?: string;
  textColor?: string;
}) {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      minH={vw(28)}
      px={vw(10)}
      borderRadius={vw(10)}
      bg={color}
      color={textColor}
      border={`${vw(1)} solid`}
    >
      <Heading fontSize={vw(14)} fontFamily={"sans-serif"} lineHeight={"1"}>
        {children}
      </Heading>
    </Box>
  );
}
