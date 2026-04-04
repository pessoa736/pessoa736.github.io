


export default function TrBlock(
    {
        children, 
        className,
        ...props
    }: React.ComponentPropsWithoutRef<"div">
)
{
    return <div 
        className=
        {
            (className || "")+`box-content p-10 rounded-2xl animated box-transparent-blur shadowLumi`
        } 

        style={{border: "1px solid var(--foregroundTR)"}}
        {
            ...props
        }
    >
        {children}
    </div>
}