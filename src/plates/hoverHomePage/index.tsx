import Image from "next/image";
import Heading from "mySite/components/heading";
import TrBlock from "mySite/components/transparentBlock";




export default function HoverHomePage()
{
    return <div 
            className="flex md:flex-row justify-center animated items-center py-14"
        >
            <TrBlock className="flex flex-col-reverse md:flex-row gap-3 animated justify-center py-14">
                <div 
                    className="flex  flex-col animated pr-4"
                >
                    <Heading 
                        className="font-bold text-nowrap animated rounded-2xl p-3"
                        style={{backgroundColor: "var(--background)"}}
                    >
                        Opa! eu<br/> 
                        chamo-me<br/> 
                        davi
                    </Heading>
                    <Heading className="text-nowrap p-3 box-colored-color animated rounded-2xl" Level={3}> 
                        e sou garoto <br/>
                        de programa
                    </Heading>
                </div>
                <Image 
                    src={"/images/jpg/eu.jpg"} 
                    width={1199} 
                    height={1341} 
                    className="size-32 md:size-48 lg:size-64 rounded-2xl animated shadowLumi"
                    style={{border: " 1px solid var(--foregroundTR)"}} 
                    alt="eu"
                />
            </TrBlock>
        </div>
}
