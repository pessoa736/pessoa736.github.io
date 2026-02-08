"use client"

import styles from "./balls.module.css"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const BALL_SIZE = 30  // espaçamento entre bolinhas em px
const BALL_P = BALL_SIZE * 0.1 + 10

export default function Balls(){
    const [grid, setGrid] = useState({ cols: 0, rows: 0 })

    useEffect(() => {
        function calcGrid() {
            const size = BALL_SIZE + BALL_P
            const cols = Math.ceil(window.innerWidth / size)
            const rows = Math.ceil(window.innerHeight / size)
            setGrid({ cols, rows })
        }
        calcGrid()
        window.addEventListener("resize", calcGrid)
        return () => window.removeEventListener("resize", calcGrid)
    }, [])

    const balls = Array.from({ length: grid.cols * grid.rows }, (_, i) => ({ id: i }))

    return <div
        className={"fixed inset-0 z-0 pointer-events-none bg-black w-screen h-screen grid place-items-center "+ styles.ball_after}
        style={
            { 
                gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, 
                gridTemplateRows: `repeat(${grid.rows}, 1fr)`
            }
        }
    >
        {
            balls.map((ball)=>
                <motion.div 
                    key={ball.id}
                    className="bg-gray-700 w-4 h-4 rounded-full z-0"
                    animate={{
                        scale: [BALL_SIZE*0.5/10, BALL_SIZE/10, BALL_SIZE*0.5/10],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: (ball.id%2) * 0.1 + Math.floor(ball.id/grid.cols)*0.1,
                        ease: "easeInOut"
                    }}
                >
                
                </motion.div>
            )
        }
    </div>
}