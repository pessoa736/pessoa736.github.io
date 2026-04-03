import { ReactElement } from "react";




export default function Page(
    {
        children, 
        className
    }:
    React.ComponentPropsWithRef<"body">
)
{
    return <div
        className="max-h-screen items-center justify-center jetbrains-mono box-color"
    >
        <main
            className={"" + (className|| "")}
        >
            {children}
        </main>
    </div>
}