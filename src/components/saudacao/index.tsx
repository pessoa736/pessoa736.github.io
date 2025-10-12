import Heading from "../ui/heading"

export default function Saudacao() {
  return (
    <div >
      <Heading 
        fontSize="calc(100vmax * 64/1300)" 
        minW={"calc(100vmax * 300/1300)"} 
        maxW={"calc(100vmax * 600/1300)"}
      >
        Ola! Bom dia, boa tarde e boa noite. Eu me chamo Davi :)
      </Heading>
    </div>  
  );
}
