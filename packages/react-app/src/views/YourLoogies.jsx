import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, List } from "antd";
import { Address, AddressInput } from "../components";
import { ethers } from "ethers";
import {Popup} from "../components";


function Home({
  readContracts,
  writeContracts,
  priceToMint,
  yourCollectibles,
  tx,
  mainnetProvider,
  blockExplorer,
  transferToAddresses,
  setTransferToAddresses,
  address,
}) {

  const initOpen = [false,false]
  const [open, setOpen] = useState(false);

  async function closeProposal () {
    setOpen(!open);
  }
  async function toggleProposal (id) {
    setOpen(!open);
  }
  function handleOpens(id){
    open[id] = true;
    return open;
  }



  async function voteProposal(index) {
    console.log("VOTO Proposta...")
    await tx(writeContracts.YourCollectible.voteProposal(index));
  }


  return (
    <div>
      <div style={{ width: 600, margin: "auto", paddingBottom: 25 }}>
      {open && <Popup                     
            handleClose={closeProposal}   
            />}
        <List
        
          dataSource={yourCollectibles}
          renderItem={item => {

            function replaceHashtag(array) {
              let text = item.text;
              for (let index = 0; index < array.length; index++) {
                text = text.replace('#',array[index])
              }
              return text;
            }
   
            function divs(){
              console.log("starting divs");
              var parent = document.createElement("div");
              parent.setAttribute("id", "proposals");
              item.proposals.forEach((element, index) =>  {
                let div = document.createElement("div")
                div.className = "proposal_row"
                //Proposer: ${element[2]},
                let html = `
                  <span class="proposal_text">Proposal: ${replaceHashtag(element[0])},  votes: ${element[1]}   
                  <button type="primary" id="prop${index}"> Vote</button>     </span>
                  `;
                div.innerHTML = html;
                parent.appendChild(div);

              })  
              console.log(parent);
              return parent;
            }
            function attachButton(){
              console.log("initialize button");
              item.proposals.forEach((element, index) =>  {
                document.getElementById("prop"+index).onclick = function(){voteProposal(index)};;
              })  
              console.log("end attachButton");
            }
            const id = item.id.toNumber();

            return (
              <List.Item key={id + "_" + item.uri + "_" + item.owner}>
  
                <Card
                
                  title={
                    <div>
                      <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                    </div>
                  }
                >
                  <img src={item.image} alt={"Loogie #" + id} />
                  <div>{item.description}</div>
                  <Button id={id} type="primary" onClick={async function(event){
                                await toggleProposal(id); 
                                console.log(open);
                                document.getElementById("popup_box").appendChild(divs());
                                attachButton();
    
                              }
                            
                            }>
                      Show Proposals
                    </Button>

                  <div style={{ marginTop: 20 }}>
                    <AddressInput
                      ensProvider={mainnetProvider}
                      placeholder="transfer to address"
                      value={transferToAddresses[id]}
                      onChange={newValue => {
                        const update = {};
                        update[id] = newValue;
                        setTransferToAddresses({ ...transferToAddresses, ...update });
                      }}
                    />
                    <Button
                      onClick={() => {
                        tx(writeContracts.YourCollectible.transferFrom(address, transferToAddresses[id], id));
                      }}
                    >
                      Transfer
                    </Button>
                  </div>
                </Card>
                
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Home;
