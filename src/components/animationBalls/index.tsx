"use client"
import { Box, BoxProps, Grid } from "@chakra-ui/react";
import { AnimatePresence, motion, MotionConfigProps} from "framer-motion";


const MotionBox = motion.div;

export default function animationBalls({...props}: BoxProps) {
    const balls = Array.from({ length: 11*15 }, (_, i) => ({ id: i })); // Exemplo com 10 bolas    
    return (
        <Box 
            position="relative"
            _after={
                {
                    background: 
                    "linear-gradient(to top, rgba(0,0,0, 1), rgba(255,255,255, 1) 50%), linear-gradient(to left, rgba(0,0,0, 1) 5%, rgba(255,255,255, 1) 65%)",
                    content: '""',
                    inset: 0,
                    zIndex: 2,
                    position: "absolute",
                    mixBlendMode: "darken",
                    backgroundBlendMode: "darken",
                    pointerEvents: "none",
                }
            }
            {...props}
        > {/* o container */}
            <AnimatePresence>
            <Grid templateColumns="repeat(15, 1fr)" gap={"calc(100vmax * 1/1300)"} >
                {balls.map((ball) => (
                        <MotionBox key={ball.id}
                            animate={{
                                scale: [0.75, 1, 0.75],
                            }}
                            transition={{
                                duration: 1.25,
                                repeat: Infinity,
                                delay: (ball.id%14) * 0.1 + Math.floor(ball.id/14) * 0.1,
                            }}
                        >
                            <Box
                                width={`calc(100vmax * ${129*0.25}/1300)`}
                                height={`calc(100vmax * ${129*0.25}/1300)`}
                                borderRadius="100%"
                                backgroundColor="#ffffff"
                                margin="calc(100vmax * 5/1300)"
                            />   
                        </MotionBox>
                ))}
            </Grid>
            </AnimatePresence>
        </Box>
    );
}