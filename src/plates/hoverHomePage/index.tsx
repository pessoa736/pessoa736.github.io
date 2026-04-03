import Image from "next/image";
import Heading from "mySite/components/heading";
import TrBlock from "mySite/components/transparentBlock";




export default function HoverHomePage()
{
    return <div 
            className="flex md:flex-row justify-center items-center py-14"
        >
            <TrBlock className="flex md:flex-row justify-center py-14">
                <div 
                    className="flex  flex-col w-88  pr-4"
                >
                    <Heading 
                        className="font-bold text-nowrap rounded-2xl p-3"
                        style={{backgroundColor: "var(--background)"}}
                    >
                        Opa! eu<br/> 
                        chamo-me<br/> 
                        davi
                    </Heading>
                    <Heading className="text-nowrap p-3 box-colored-color rounded-2xl" Level={3}> 
                        e sou garoto <br/>
                        de programa
                    </Heading>
                </div>
                <Image 
                    src={"/images/jpg/eu.jpg"} 
                    width={250} 
                    height={250} 
                    className="size-64 rounded-2xl shadowLumi"
                    style={{border: " 1px solid var(--foregroundTR)"}} 
                    alt="eu"
                />
            </TrBlock>
        </div>
}
