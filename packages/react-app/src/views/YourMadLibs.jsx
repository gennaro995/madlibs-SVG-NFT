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
  tx,
  contractName,
  mainnetProvider,
  blockExplorer,
  transferToAddresses,
  setTransferToAddresses,
  address,
  totalSupply
}) {

  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState();
  const [yourCollectibles, setYourCollectibles] = useState();
  const DEBUG = true;
  useEffect(()=>{
    const updateProposals = async ()=> {
      if(readContracts && readContracts[contractName] && currentItem){
        currentItem.proposals=await tx(readContracts[contractName].getProposals(currentItem.id));
      }
    }
    updateProposals();
  },[currentItem])

  useEffect(() => {
    const updateYourCollectibles = async () => {
      //setLoadingLoogies(true);
      const collectibleUpdate = [];
      //let startIndex = totalSupply - 1 - perPage * (page - 1);
      for (let tokenIndex = 0; tokenIndex < totalSupply; tokenIndex++) {
      //for (let tokenIndex = startIndex; tokenIndex > startIndex - perPage && tokenIndex >= 0; tokenIndex--) {
        try {
          if (DEBUG) console.log("Getting token index", tokenIndex);
          const tokenId = await readContracts[contractName].tokenOfOwnerByIndex(address, tokenIndex);
          if (DEBUG) console.log("Getting Loogie tokenId: ", tokenId);
          const tokenURI = await readContracts[contractName].tokenURI(tokenId);
          if (DEBUG) console.log("tokenURI: ", tokenURI);
          const jsonManifestString = atob(tokenURI.substring(29));

          const proposals = await readContracts[contractName].getProposals(tokenId);
          if (DEBUG) console.log("proposals: ", proposals);

          const text = await readContracts[contractName]._madlibs(tokenId);

          if (DEBUG) console.log("text: ", text[1]);

          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI,closed: text[3], owner: address,proposals: proposals, text: text[1], ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate.reverse());
    };
    updateYourCollectibles();
  }, [currentItem]);

  const toggleProposal = () => {
    setOpen(!open);
  }

  async function voteProposal(index) {
    console.log("VOTO Proposta...")
    await tx(writeContracts[contractName].voteProposal(index));
  }
  function replaceHashtag(array, item) {
    let text = item.text;
    for (let index = 0; index < array.length; index++) {
      text = text.replace('#',array[index])
    }
    return text;
  }

  function getPopupContent(){
    let content=[];
      currentItem.proposals.forEach((element, index) =>  {

        content.push(
          <div key={index} id={'proposal'+index}>
                   <span>
                    <label style={{marginRight:8}}>
                      Proposer: 
                    </label>
                   <Address style={{marginLeft:8}}
                     address={element[2]}
                     ensProvider={mainnetProvider}
                     blockExplorer={blockExplorer}
                     fontSize={16}
                     />
                     <label style={{marginLeft:8}}>
                     Proposal: {replaceHashtag(element[0], currentItem)}, votes: {element[1].toNumber()}
                     </label>
                     <Button style={{marginLeft:8, marginBottom:2}}type="primary" onClick={async function () {
                       await voteProposal(index);
                       currentItem.proposals=await tx(readContracts[contractName].getProposals(currentItem.id));}}>Vote</Button>
                   </span>
                 </div>);
       
       
       });
      return(content);
      
    
  }

  return (
    <div>
      <div style={{ width: 600, margin: "auto", paddingBottom: 25 }}>
      {open && <Popup  content={getPopupContent()}                 
            handleClose={toggleProposal}   
            />}
        <List
        
          dataSource={yourCollectibles}
          renderItem={item => {


   
            // function divs(){
            //   console.log("starting divs");
            //   var parent = document.createElement("div");
            //   parent.setAttribute("id", "proposals");
            //   item.proposals.forEach((element, index) =>  {
            //     let div = document.createElement("div")
            //     div.className = "proposal_row"
            //     //Proposer: ${element[2]},
            //     let html = `
            //       <span class="proposal_text">Proposal: ${replaceHashtag(element[0])},  votes: ${element[1]}   
            //       <button type="primary" id="prop${index}"> Vote</button>     </span>
            //       `;
            //     div.innerHTML = html;
            //     parent.appendChild(div);

            //   })  
            //   console.log(parent);
            //   return parent;
            // }
            // function attachButton(){
            //   console.log("initialize button");
            //   item.proposals.forEach((element, index) =>  {
            //     document.getElementById("prop"+index).onclick = function(){voteProposal(index)};;
            //   })  
            //   console.log("end attachButton");
            // }
            const id = item.id.toNumber();
            const isClosed = item.closed;

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
                                item.proposals = await tx(readContracts[contractName].getProposals(item.id));
                                setCurrentItem(item);
                          
                                await toggleProposal(); 
                                // document.getElementById("popup_box").appendChild(divs());
                                // attachButton();
    
                              }
                            
                            }>
                      SHOW PROPOSALS
                    </Button>
                    {!isClosed && item.owner.toLowerCase() == address.toLowerCase() ? (
                          <div>
                            <Button style={{marginTop:8, marginBottom: 8}} type="primary" onClick={
                                  async () => {                                   
                                      let txClose = await tx(writeContracts[contractName].closeMadLib(id));
                                  }
                              }>CLOSE MADLIB
                              </Button>
                          </div>
                      ) :
                          (
                            <div>
                            </div>
                            )
                      }
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
                        tx(writeContracts[contractName].transferFrom(address, transferToAddresses[id], id));
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
