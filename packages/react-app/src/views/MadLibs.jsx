import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, List, Spin, Input} from "antd";
import { Address } from "../components";
import { ethers } from "ethers";
import {Popup} from "../components";

import {useThemeSwitcher} from "react-css-theme-switcher";
import { id } from "ethers/lib/utils";

function MadLibs({ readContracts,writeContracts,tx,contractName, mainnetProvider, blockExplorer, totalSupply, DEBUG, address}) {
  const [allMadLibs, setAllMadLibs] = useState();
  const [page, setPage] = useState(1);
  const [loadingMadLibs, setLoadingMadLibs] = useState(true);
  const perPage = 8;
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState([]); // '' is the initial state value
  const [insertProp, setInsertProp] = useState(true); // '' is the initial state value
  const [currentItem, setCurrentItem] = useState();
  const [toUpdate, setToUpdate] = useState(false);

  const { currentTheme } = useThemeSwitcher();


  const toggleProposal = () => {
    setOpen(!open);
    if(!open){
      setInputText('');
    }
  }
  // useEffect(() => {
  //   function renderProposals() {
  //     console.log(proposals);
  //     {open && <Popup
  //       content={getPopupContent()}
  //       handleClose={toggleProposal}
  //  />}    }
  //   renderProposals();
  // }, [proposals]);

  async function voteProposal(index) {
    console.log("VOTO Proposta...")
    await tx(writeContracts[contractName].voteProposal(index));
    // location.reload();
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
              <div style={{ marginLeft: "30%",marginRight: "25%"}}>
              <form id="proposals">
                  <div>
                    <div>
                    <h3 style={{ color: currentTheme==="light" ? '#222222':'white'}}>Insert your Proposals!</h3>
                    <div>
                      <label style={{fontStyle: 'italic'}}>{currentItem?.text}</label>
                    </div>
                    <br />
                    <h4 style={{ color: currentTheme==="light" ? '#222222':'white'}}>Use comma to separate words ({currentItem?.nBlanks})</h4>
                    </div>
                    <Input placeholder="your proposals" type="text" style={{resize: 'none', background: currentTheme==="light" ? 'white':'#212121'}} rows="4" cols="50" value={inputText} onInput={e => {
                      var proposals = (e.target.value).split(/(?:,| )+/);
                      setInputText(proposals)
                    }} />
                                 
                   <Button style={{marginTop:16, marginBottom: 8}}
                       type="primary"
                       onClick={
                       async () => {
                       console.log("text: ", inputText);
                       toggleProposal();
                       let txCur = await tx(writeContracts[contractName].addProposal(inputText));
                      //  location.reload();
                        //currentItem.proposals=await tx(readContracts[contractName].getProposals(lastId));
                     }}
                 >Insert Proposal
                 </Button>
                  </div>

       
               </form>
              </div>
             </>
          )
      }else{
        if (currentItem.proposals.length===0){
          return (<div> No proposals yet</div>)
        }
        currentItem.proposals.forEach((element, index) =>  {

          content.push(
          <div key={index} id={'proposal'+index}>
                     <span>
                     <b>
                      <label style={{marginRight:8}}>
                        Proposer: 
                      </label>
                      </b>
                     <Address style={{marginLeft:8}}
                       address={element[2]}
                       ensProvider={mainnetProvider}
                       blockExplorer={blockExplorer}
                       fontSize={16}
                       />
                       <div>
                       <b>
                        <label style={{marginLeft:8}}>
                        Proposal:
                        </label>
                       </b>
                       <label style={{marginLeft:8}}>
                        {replaceHashtag(element[0], currentItem)}, votes: {element[1].toNumber()}
                       </label>
                       {!currentItem.closed ? (
                        <Button style={{marginLeft:8}}type="primary" onClick={async function () { 
                          await voteProposal(index);
                          currentItem.proposals=await tx(readContracts[contractName].getProposals(currentItem.id));}}>Vote</Button>
                        ) : (<div>
                       </div>)}
                       </div>
                     </span>
                   </div>);
         
         
         });
        return(content);
        
      }
    }

  useEffect(() => {
    const updateAllLoogies = async () => {
      if (readContracts[contractName] && totalSupply) {
        setLoadingMadLibs(true);
        const collectibleUpdate = [];
        let startIndex = totalSupply - 1 - perPage * (page - 1);
        for (let tokenIndex = startIndex; tokenIndex > startIndex - perPage && tokenIndex >= 0; tokenIndex--) {
          try {
            if (DEBUG) console.log("Getting token index", tokenIndex);
            const tokenId = await readContracts[contractName].tokenByIndex(tokenIndex);
            if (DEBUG) console.log("Getting Loogie tokenId: ", tokenId);
            const tokenURI = await readContracts[contractName].tokenURI(tokenId);
            if (DEBUG) console.log("tokenURI: ", tokenURI);
            const jsonManifestString = atob(tokenURI.substring(29));


            const proposals = await readContracts[contractName].getProposals(tokenId);
            if (DEBUG) console.log("proposals: ", proposals);
  

            const madLib = await readContracts[contractName]._madlibs(tokenId);
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
        setAllMadLibs(collectibleUpdate);
        setLoadingMadLibs(false);
      }
    };
    updateAllLoogies();
  }, [readContracts[contractName], toUpdate,currentItem,(totalSupply || "0").toString(), page]);

  useEffect(()=>{
    const updateProposals = async ()=> {
      if(readContracts && readContracts[contractName] && currentItem){
        currentItem.proposals=await tx(readContracts[contractName].getProposals(currentItem.id));
      }
    }
    updateProposals();
  },[currentItem]);

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
            loading={loadingMadLibs}
            dataSource={allMadLibs}
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
                          <Button style={{marginTop:8, marginBottom: 8}} type="primary" onClick={()=>{setInsertProp(true); toggleProposal(); setCurrentItem(item);}}>
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
                                          item.proposals = await tx(readContracts[contractName].getProposals(item.id));
                                          setCurrentItem(item);        
                                          setToUpdate(false);

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
                                      let txClose = await tx(writeContracts[contractName].closeMadLib(id));
                                      setToUpdate(true);
                                      // location.reload();
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

export default MadLibs;