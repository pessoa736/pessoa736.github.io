"use client"
import { Box, BoxProps, Grid } from "@chakra-ui/react";
import { AnimatePresence, motion} from "framer-motion";
import { staticPropotion } from "site/utils/staticPropotion";


const MotionBox = motion.div;

export default function animationBalls({...props}: BoxProps) {
    const balls = Array.from({ length: 11*15 }, (_, i) => ({ id: i })); // Exemplo com 10 bolas    
    return (
        <Box 
            position="relative"
            maxHeight={staticPropotion(475)}
            minH={staticPropotion(475)}
            _after={
                {
                    background: 
                    "linear-gradient(to top, rgba(0,0,0, 1) 1%, rgba(128, 128,128, 1) , rgba(255,255,255, 1) 75%), linear-gradient(to left, rgba(0,0,0, 1) 1%,rgba(128, 128,128, 1), rgba(255,255,255, 1) 75%)",
                    content: '""',
                    inset: 0,
                    zIndex: 2,
                    position: "absolute",
                    mixBlendMode: "darken",
                    backgroundBlendMode: "darken",
                    pointerEvents: "none",
                    maxHeight: staticPropotion(475),
                    minH: staticPropotion(475)
                }
            }
            {...props}
        > {/* o container */}
            <AnimatePresence>
            <Grid 
                templateColumns="repeat(15, 1fr)" 
                gap={"none"} 
                maxHeight={staticPropotion(475)}
                minH={staticPropotion(475)}
                maxW={staticPropotion(620)}
                minW={staticPropotion(620)}
            >
                {balls.map((ball) => (
                        <MotionBox key={ball.id}
                            animate={{
                                scale: [0.25, 1, 0.25],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: (ball.id%2) * 0.1 + Math.floor(ball.id/15)*0.1,
                                ease: "easeInOut"
                            }}
                        >
                            <Box
                                width={staticPropotion(129*0.25)}
                                height={staticPropotion(129*0.25)}
                                borderRadius="100%"
                                backgroundColor="#ffffff"
                            />   
                        </MotionBox>
                ))}
            </Grid>
            </AnimatePresence>
        </Box>
    );
}