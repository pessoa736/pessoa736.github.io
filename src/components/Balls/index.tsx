"use client"

import styles from "./balls.module.css"
import {ReactElement, useEffect, useRef} from "react"



const BALL_SIZE = 30  // espaçamento entre bolinhas em px
const BALL_P = BALL_SIZE * 0.1 + 10
const PI = Math.PI




function calcNBalls(size: number)
{
    return Math.floor(size / (BALL_SIZE + BALL_P))
}


function lerp(a: number, b: number, t: number){
    return a*(1-t)+b*t
}

function zipzop(n: number){
    return Math.abs(Math.cos(n)/Math.PI)
}


export default function Balls({children}:{children?: ReactElement| ReactElement[]})
{
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(
        ()=>{
            const canvas = canvasRef.current
            const container = containerRef.current
            if (!canvas || !container)return;

            const ctx = canvas.getContext("2d")
            
            let frame = 0;
            let rafId = 0;
            function updateCanvas(){
                const rect = container?.getBoundingClientRect()
                if (!ctx || !canvas || !rect) return;

                const w = rect.width
                const h = Math.min(rect.height, 800)

                canvas.width =  w
                canvas.height = h
                canvas.style.width = w + "px"
                canvas.style.height = h + "px"
                
                ctx.imageSmoothingEnabled = false;

                const ballcolor = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
                const bg = getComputedStyle(document.documentElement).getPropertyValue("--background")
                ctx.fillStyle = ballcolor

                const Ballsnx = calcNBalls(w) 
                const Ballsny = calcNBalls(h) 
                const totalWidth = Ballsnx * (BALL_SIZE + BALL_P);
                const totalHeight = Ballsny * (BALL_SIZE + BALL_P);
                const offsetX = (canvas.width - totalWidth) / 2;
                const offsetY = (canvas.height - totalHeight) / 2;

                for (let i = 0; i<(Ballsnx*Ballsny); i++){
                    ctx.beginPath()
                    ctx.arc(
                        offsetX + (i%Ballsnx) * (BALL_SIZE + BALL_P),
                        offsetY + Math.floor(i/Ballsnx) * (BALL_SIZE + BALL_P),
                        lerp(0.1, 1.5, zipzop(frame/250 - i/8))*BALL_SIZE,
                        0, 
                        2*PI
                    )
                    ctx.fill()
                }

                for (let i = 0; i<=1; i++){
                    const grad = ctx.createLinearGradient(0, 0, w*(1-i), h*i)

                    grad.addColorStop(0, "#00000000")
                    grad.addColorStop(0.9, bg)

                    ctx.fillStyle = grad
                    ctx.beginPath()
                    ctx.rect(0, 0, w, h)
                    ctx.fill()
                }
                frame++;
                rafId = requestAnimationFrame(updateCanvas);
            }

            updateCanvas()

            return ()=>cancelAnimationFrame(rafId)
        }, 
    [])

    return <div className="justify-center" ref={containerRef}>
        <canvas 
            ref={canvasRef}
            className={"pointer-events-none grid place-items-center "+ styles.ball_after}
            style={{position: "absolute", width: "100%", height: "100%"}}
        >
        </canvas>
        <div style={{position: "relative", zIndex: 2}}>
            {children}
        </div>
    </div>
}