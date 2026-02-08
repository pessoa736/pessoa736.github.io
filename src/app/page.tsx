"use client"

import Balls from "mySite/components/Balls";
import Page from "mySite/components/page";
import Image from "next/image";


export default function Home() {
  return (
    <>
      <Balls />
      <Page>
        <div className="relative z-10 flex md:flex-row flex-col">
          <div className="flex flex-col w-88 h-66">
            <h1 className="jetbrains-mono font-bold text-6xl ">Opa! eu chamo-me davi</h1>
            <h2 className="jetbrains-mono text-3xl"> e sou garoto de programa</h2>
          </div>
          <Image src={"/images/jpg/eu.jpg"} width={250} height={250} className="size-64 rounded-2xl border-2 border-white" alt="eu"></Image>
        </div>
      </Page>
    </>
  );
}
