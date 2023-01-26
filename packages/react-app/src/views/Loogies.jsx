import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, List, Spin } from "antd";
import { Address } from "../components";
import { ethers } from "ethers";
import {Popup} from "../components";
import { Transactor, Web3ModalSetup } from "../helpers";
import {useUserProviderAndSigner} from "eth-hooks";
import Item from "antd/lib/list/Item";
import {useThemeSwitcher} from "react-css-theme-switcher";

function Loogies({ readContracts,writeContracts,tx, mainnetProvider, blockExplorer, totalSupply, DEBUG, address }) {
  const [allLoogies, setAllLoogies] = useState();
  const [page, setPage] = useState(1);
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const perPage = 8;
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState([]); // '' is the initial state value
  const [insertProp, setInsertProp] = useState(true); // '' is the initial state value
  const [currentItem, setCurrentItem] = useState();
  const { currentTheme } = useThemeSwitcher();

  const toggleProposal = () => {
    setOpen(!open);
  }

  const handleFormChange = (event, index) => {
    let data = [...inputText];
    data[index][event.target.name] = event.target.value;
    setInputText(data);
  }

  async function voteProposal(index) {
    console.log("VOTO Proposta...")
    await tx(writeContracts.YourCollectible.voteProposal(index));
    location.reload();
  }
  const addFields = () => {
    let object = {
      text: ''
    }

    setInputText([...inputText, object])
  }
  // function divs(item){
  //   console.log("starting divs");
  //   var parent = document.createElement("div");
  //   parent.setAttribute("id", "proposals");
  //   item.proposals.forEach((element, index) =>  {
  //     let div = document.createElement("div")
  //     div.className = "proposal_row"
  //     //Proposer: ${element[2]},
  //     let html = `
  //       <span class="proposal_text">Proposal: ${replaceHashtag(element[0], item)},  votes: ${element[1]}   
  //       <button type="primary" id="prop${index}"> Vote</button>     </span>
  //       `;
  //     div.innerHTML = html;
  //     parent.appendChild(div);

  //   })  
  //   console.log(parent);
  //   return parent;
  // }
  function replaceHashtag(array,item) {
    let text = item.text;
    for (let index = 0; index < array.length; index++) {
      text = text.replace('#',array[index])
    }
    return text;
  }
  // function attachButton(item){
  //   console.log("initialize button");
  //   item.proposals.forEach((element, index) =>  {
  //     document.getElementById("prop"+index).onclick = function(){voteProposal(index)};;
  //   })  
  //   console.log("end attachButton");
  // }

    function getPopupContent(){
      console.log("insertProp", insertProp);
      let content=[];
      if (insertProp){
          return (
            <>
              <div>
              <form id="proposals">

                 <label>
                  <div>
                    <div>
                    <h3 style={{ color: currentTheme==="light" ? '#222222':'white'}}>Insert your Proposals!</h3>
                    <br />
                    <h4 style={{ color: currentTheme==="light" ? '#222222':'white'}}>Use comma to separate words </h4>
                     Text:
                    </div>
                    <input type="text" style={{resize: 'none', background: currentTheme==="light" ? 'white':'#212121'}} rows="4" cols="50" value={inputText} onInput={e => {
                      var proposals = (e.target.value).split(/(?:,| )+/);
                      setInputText(proposals)
                    }} />
                  </div>

                   <br />
                   
                 </label>
            
                 <Button style={{marginTop:8, marginBottom: 8}}
                     type="primary"
                     onClick={
                     async () => {
                     console.log("text: ", inputText);
                     
                     let txCur = await tx(writeContracts.YourCollectible.addProposal(inputText));
                     location.reload();
                   }}
               >Insert Proposal
               </Button>
               </form>
              </div>
             </>
          )
      }else{
        currentItem.proposals.forEach((element, index) =>  {

          content.push(
          <div>
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
                       {!currentItem.closed ? (
                        <Button style={{marginLeft:8}}type="primary" onClick={async function () { await voteProposal(index)}}>Vote</Button>
                        ) : (<div>
                       </div>)}
                       
                     </span>
                   </div>);
         
         
         });
        return(content);
        
      }
    }

  useEffect(() => {
    const updateAllLoogies = async () => {
      if (readContracts.YourCollectible && totalSupply) {
        setLoadingLoogies(true);
        const collectibleUpdate = [];
        let startIndex = totalSupply - 1 - perPage * (page - 1);
        for (let tokenIndex = startIndex; tokenIndex > startIndex - perPage && tokenIndex >= 0; tokenIndex--) {
          try {
            if (DEBUG) console.log("Getting token index", tokenIndex);
            const tokenId = await readContracts.YourCollectible.tokenByIndex(tokenIndex);
            if (DEBUG) console.log("Getting Loogie tokenId: ", tokenId);
            const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
            if (DEBUG) console.log("tokenURI: ", tokenURI);
            const jsonManifestString = atob(tokenURI.substring(29));


            const proposals = await readContracts.YourCollectible.getProposals(tokenId);
            if (DEBUG) console.log("proposals: ", proposals);
  

            const madLib = await readContracts.YourCollectible._madlibs(tokenId);
            const nBlanks = madLib[2];
            const closed = madLib[3];
            const text = madLib[1]


            if (DEBUG) console.log("Getting nblanks: ", nBlanks);

            try {
              const jsonManifest = JSON.parse(jsonManifestString);
              collectibleUpdate.push({ id: tokenId, closed:closed, uri: tokenURI,nBlanks: nBlanks,proposals: proposals,text: text, ...jsonManifest });
            } catch (e) {
              console.log(e);
            }
          } catch (e) {
            console.log(e);
          }
        }
        setAllLoogies(collectibleUpdate);
        setLoadingLoogies(false);
      }
    };
    updateAllLoogies();
  }, [readContracts.YourCollectible, (totalSupply || "0").toString(), page]);

  return (
    <div style={{ width: "auto", margin: "auto", paddingBottom: 25, minHeight: 800 }}>
      {false ? (
        <Spin style={{ marginTop: 100 }} />
      ) : (
        <div>
           {open && <Popup
                 content={getPopupContent()}
                 handleClose={toggleProposal}
            />}
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 4,
              xxl: 4,
            }}
            pagination={{
              total: totalSupply,
              defaultPageSize: perPage,
              defaultCurrent: page,
              onChange: currentPage => {
                setPage(currentPage);
              },
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${totalSupply} items`,
            }}
            loading={loadingLoogies}
            dataSource={allLoogies}
            renderItem={item => {
              const id = item.id.toNumber();
              const isClosed = item.closed;
              return (
                
                <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                  <Card style={{marginLeft: 20}}
                    title={
                      <div>
                        <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                      </div>
                    }
                  >
                    <img src={item.image} alt={"Loogie #" + id} />
                    <div>{item.description}</div>
                    <div>
                      <Address
                        address={item.owner}
                        ensProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                        fontSize={16}
                      />
                      <div>
                      {!isClosed ? (
                        <div>
                          <Button style={{marginTop:8, marginBottom: 8}} type="primary" onClick={()=>{setInsertProp(true); toggleProposal();}}>
                            INSERT PROPOSAL
                          </Button>
                        </div>
                      ) :
                          (
                            <div>
                            </div>
                            )
                      }
                          <Button style={{marginTop:8, marginBottom: 8}} id={id} type="primary" onClick={
                                async function(event){
                                          setInsertProp(false);
                                          setCurrentItem(item);
                                          await toggleProposal(); 
                                      }
                                  }>
                                SHOW PROPOSALS
                          </Button>

                      </div>
                      {!isClosed && item.owner.toLowerCase() == address.toLowerCase() ? (
                          <div>
                            <Button style={{marginTop:8, marginBottom: 8}} type="primary" onClick={
                                  async () => {                                   
                                      let txClose = await tx(writeContracts.YourCollectible.closeMadLib(id));
                                      location.reload();
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
                      
                    </div>
                  </Card >
                </List.Item>
              );
            }}
          />
        </div>
        
      )}
    </div>
  );
}

export default Loogies;