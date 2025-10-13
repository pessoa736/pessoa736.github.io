
import Header from "./header";
import Timeline from "./timeline";



export default function TemplatePage({children}: {children?: React.ReactNode}) {
    return (
        <main style={{backgroundColor: "#000", minWidth: "100vmax", maxWidth: "100vmax", position: "absolute"}}>
            <Header />
            <Timeline>
                {children}
            </Timeline>
        </main>
    );
}