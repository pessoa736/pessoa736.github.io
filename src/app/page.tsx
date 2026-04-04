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
  thumbnail?: string
  homepage?: string
  has_pages: boolean
  idmap: number
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
    let idmap = 0
    const loadrepos = async ()=>
    {
      try 
      {
        const response = await fetch("https://api.github.com/users/pessoa736/repos")
        let data = (await response.json()) as project[]
        
        if (data)
        {
          data = data 
            .sort((a,b)=>new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5)
            .map((v:project)=>
              {
                if (!v.has_pages){ idmap++; return {...v, idmap} }

                const imagerota = 
                  v.name == "pessoa736.github.io" 
                    ? "https://pessoa736.github.io/images/projImg.png"
                    : "https://pessoa736.github.io/" + v.name + "/images/projImg.png"

                console.log(imagerota)

                idmap++
                return{...v, thumbnail: imagerota, idmap}
              }
            )
        }
        
        console.log(data)
        setProjs(data)
      } 
      catch (error) 
      {
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
        className="flex flex-col text-center items-center mx-20 md:mx-40 lg:mx-60 animated gap-1.5"
      >
        <hr className=" my-8 w-full animated min-w-96 "/>
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="min-w-96 animated max-w-7xl pt-6">
            <Heading Level={3} className="mb-1">minha stack</Heading>
          </div>

          <div className="min-w-96 animated max-w-6xl pt-6">
            <Heading Level={3} className="mb-1">meu projetos recentes</Heading>
            <Heading Level={9} className="mb-7">(diretamente vinculado no github)</Heading>
            <div className="grid grid-flow-dense grid-cols-2 md:grid-cols-3  auto-rows-[250px] auto-cols-[100px] animated  mb-6 gap-3">
              {
                projs
                .map(
                  (v, i)=>
                  {
                    const sizeClass = 
                      i % 7 === 0
                        ? "col-span-2 row-span-2"
                        : i % 5 === 0 
                          ? "row-span-2"
                          : i % 4 === 0
                            ? "col-span-2"
                            : "col-span-1 row-span-1"

                    return <a 
                      key={v.id} 
                      href={v.html_url}
                      className={sizeClass + " flex items-center rounded-2xl hover:scale-105 hover:z-10 z-auto animated overflow-hidden justify-center relative"}
                      style={{
                        backgroundImage: v.thumbnail ? `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)),url(${v.thumbnail})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "var(--foregroundTR)"
                      }}
                      
                    >
                      <Heading Level={6}>{ v.name }</Heading>
                    </a>
                  }
                )
              }
            </div>
          </div>
        </div>
        <hr className=" my-8 w-full animated min-w-96 max-w-5xl"/>

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
