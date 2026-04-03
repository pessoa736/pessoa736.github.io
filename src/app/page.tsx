"use client"


import Balls from "mySite/components/Balls";
import Heading from "mySite/components/heading";
import Page from "mySite/components/page";
import HoverHomePage from "mySite/plates/hoverHomePage";
import { useEffect, useState } from "react";


interface project {
  name: string
  id: number
  updated_at: string
  html_url: string
}


export default function Home() 
{
  const [projs, setProjs] = useState<project[]>([])

  const data = new Date().getTime()
  const meuaniversario = new Date(2005, 9, 21).getTime()
  const myage = Math.floor((data - meuaniversario)/(60*60*24*365*1000))

  const ingressoNaUf = new Date(2025, 7, 21).getTime()
  const semestre = Math.floor((data - ingressoNaUf)/(60*60*24*365*1000/2))


  useEffect(()=>{
    const loadrepos = async ()=>{
      try {
        const response = await fetch("https://api.github.com/users/pessoa736/repos")
        const data = await response.json()
        setProjs(data)
      } catch (error) {
        console.error("error :", error)
      }
    }
    loadrepos()
  },[])
  

  return (  
    <Page className="">
      <Balls>
          <HoverHomePage />
      </Balls>
      <div
        className="flex flex-col text-center items-center mx-40 md:mx-80 gap-1.5"
      >
        <hr className=" my-8 w-full min-w-96 max-w-5xl"/>

        <div className="min-w-96 w-full pt-6">
          <Heading Level={3}>meu projetos recentes</Heading>
          <div className="grid justify-center items-center mb-6 gap-3">
            {
              projs
              .sort((a,b)=>new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .slice(0, 6)
              .map(
                (v)=>
                  <div 
                    key={v.id}
                    className={`${v.id%3 !== 0 ? "item": "item-big"}  box-content rounded-2xl`}
                    style={{
                      backgroundImage: "url()",
                      gridColumn: "span 2"
                    }}
                    onClick={()=>{window.location.href = v.html_url}}
                  >
                    {v.name || ""}
                  </div>
              )
            }
          </div>
        </div>

        {/* <Heading Level={2}>minha stack</Heading>
        <div className="flex flex gap-5">
          
          <div className="flex flex-col gap-3 ">
            <Heading Level={3}>core</Heading>
            <List list={[
              "Lua",
              "javascript",
              "typescript",
            ]}/>
          </div>

          <div className="flex flex-col gap-3 ">
            <Heading Level={3}>ferramentas</Heading>
            <List list={[
              "Git e Github",
              "node.js",
              "next.js e React.js",
              "luarocks",
            ]}/>
          </div>

        </div> */}
        
        {/* <Heading className="" Level={2}> 
          educação
        </Heading>
        <List list={[
          <div key={0}>
            Universidade Federal do Rio Grande do Norte<br/> 
            Bacharelado interdiciplinar em Ciência e Tecnologia<br/> 
            ago de 2025 – ago de 2028
          </div>
        ]}/> */}

      </div>
    </Page>
  );
}
