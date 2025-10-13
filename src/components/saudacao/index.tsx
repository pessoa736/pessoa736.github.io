import { staticPropotion } from "site/utils/staticPropotion";
import Heading from "../ui/heading"

export default function Saudacao() {
  return (
    <div >
      <Heading 
        fontSize={staticPropotion(64)} 
        minW={staticPropotion(300)} 
        maxW={staticPropotion(600)}
      >
        Ola! Bom dia, boa tarde e boa noite. Eu me chamo Davi :)
      </Heading>
    </div>  
  );
}
