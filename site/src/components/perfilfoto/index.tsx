"use client"

import { Image, ImageProps } from "@chakra-ui/react";
import { motion } from "motion/react";

interface PerfilFotoProps extends ImageProps {}

export default function PerfilFoto({...props}: PerfilFotoProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.6, type: "spring", stiffness: 100 }}
        >
            <Image 
                src={props.src || "/i.jpg"}
                alt={props.alt || "Imagem"}
                borderRadius={props.borderRadius || "xl"}
                boxSize={props.boxSize || ["150px", "200px", "300px"]} 
                objectFit={props.objectFit || "cover"}
                {...props}
            />
        </motion.div>
    );
}
