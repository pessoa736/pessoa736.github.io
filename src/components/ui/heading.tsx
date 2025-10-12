import { Heading as ChakraHeading, HeadingProps } from "@chakra-ui/react";


export default function Heading({ children, f,  ...props }: HeadingProps & {f?: boolean}) {
  return (
    <ChakraHeading 
        fontFamily={f ? "quicksand" : "odibee sans"}
        lineHeight={"110%"}
        letterSpacing={"104%"}
    {...props}>
      {children}
    </ChakraHeading>
  );
}