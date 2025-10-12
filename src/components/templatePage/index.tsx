
import Timeline from "./timeline";



export default function TemplatePage({children}: {children?: React.ReactNode}) {
    return (
        <div style={{backgroundColor: "#000", minHeight: "100vh", width: "100vmax", position: "absolute"}}>
            <Timeline>
                {children}
            </Timeline>
        </div>
    );
}