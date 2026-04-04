

//type _R = ReactElement<any, any> | undefined | string| number

import React, { JSX } from "react"




export default function List(
    {
        className,
        LiProps,
        list,
        ...ulProps
    }: React.ComponentPropsWithoutRef<"ul"> & {
        list: (string|number|React.ReactNode)[]
        LiProps?: React.ComponentPropsWithoutRef<"li">
    }
)
{
    
    return <ul 
        className={(className+"") + "text-left list-none"}  
        {...ulProps}
    >
        {
            list.map((v, idx)=>
                <li 
                    key={idx} 
                    {...(LiProps || {})}
                    className={"flex items-center"+((LiProps||{}).className || "")}
                >
                    <span className="w-2 h-2 box-color-inverted animated rounded-full mr-7 inline-block" />
                    <span>{v}</span>
                </li>
            )
        }
        

    </ul>
}