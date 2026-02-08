import { ReactElement } from "react";




export default function Page({children}: {children?: ReactElement | ReactElement[]}){
    return <div
        className="relative flex min-h-screen items-center justify-center jetbrains-mono"
    >
        <main
            className="box-content"
        >
            {children}
        </main>
    </div>
}