

//type _R = ReactElement<any, any> | undefined | string| number

import { clamp } from "framer-motion"



export default function Heading(
    {
        children, 
        className,
        Level = 1,
        ...props
    }: React.ComponentPropsWithoutRef<"h1"> & {
        Level?: number
    }
)
{
    const sizes = ["text-6xl", "text-5xl", "text-4xl", "text-3xl", "text-2xl", "text-xl", "text-sm"];
    const sizeClass = sizes[clamp(1, 7, Level) - 1] || "text-xl";
    
    return <h1 className={(className || "")+` jetbrains-mono animated ${sizeClass} mb-4`} {...props}>
        {children}
    </h1>
}