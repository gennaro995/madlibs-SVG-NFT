import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, List, Spin } from "antd";
import { Address } from "../components";
import { ethers } from "ethers";
import {Popup} from "../components";
import { Transactor, Web3ModalSetup } from "../helpers";
import {useUserProviderAndSigner} from "eth-hooks";

function Loogies({ readContracts,writeContracts,tx, mainnetProvider, blockExplorer, totalSupply, DEBUG, address }) {
  const [allLoogies, setAllLoogies] = useState();
  const [page, setPage] = useState(1);
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const perPage = 8;
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState([]); // '' is the initial state value

  const toggleProposal = () => {
    setOpen(!open);
  }

  const handleFormChange = (event, index) => {
    let data = [...inputText];
    data[index][event.target.name] = event.target.value;
    setInputText(data);
  }


  const addFields = () => {
    let object = {
      text: ''
    }

    setInputText([...inputText, object])
  }
  const add = (nBlanks) =>{
    console.log("numero di text:", nBlanks)
    for (let i = 0; i<nBlanks; i++){
        //Create an input type dynamically.
        var element = document.createElement("textarea");
        
        //Create Labels
        var label = document.createElement("Label");
        label.innerHTML = "New Label";     
        
        //Assign different attributes to the element.
        element.setAttribute("value", "");
        element.setAttribute("name", "Test Name");
        element.setAttribute("style", "width:200px");
        
        label.setAttribute("style", "font-weight:normal");
        
        // 'foobar' is the div id, where new fields are to be added
        var foo = document.getElementById("proposals");
        
        //Append the element in page (in span).
        foo.appendChild(label);
        foo.appendChild(element);
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

            const madLib = await readContracts.YourCollectible._madlibs(tokenId);
            const nBlanks = madLib[2];
            const closed = madLib[3];


            if (DEBUG) console.log("Getting nblanks: ", nBlanks);

            try {
              const jsonManifest = JSON.parse(jsonManifestString);
              collectibleUpdate.push({ id: tokenId, closed:closed, uri: tokenURI,nBlanks: nBlanks, ...jsonManifest });
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
                  <Card
                    title={
                      <div>
                        <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                      </div>
                    }
                  >
                    <img src={item.image} alt={"Loogie #" + id} width="200" />
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
                          <Button type="primary" onClick={toggleProposal}>
                            INSERT PROPOSAL
                          </Button>
                        </div>
                      ) :
                          (
                            <div>
                            </div>
                            )
                      }
                        {open && <Popup
                            content={<>
                              <form id="proposals">
                                <h3 style={{color: 'navy'}}>Insert your Proposals!</h3>
                                <br />
                                <h4 style={{color: 'navy'}}>Use comma to separate words </h4>
                                 <br />
                                <label>
                                  Text: <span></span>
                                  <input type="text" style={{resize: 'none', background: 'red'}} rows="4" cols="50" value={inputText} onInput={e => {
                                    var proposals = (e.target.value).split(/(?:,| )+/);
                                    setInputText(proposals)
                                  }} />
                                  <br />
                                  
                                </label>
                                <br />

                                <Button
                                    type="primary"
                                    onClick={
                                    async () => {
                                    console.log("text: ", inputText);
                                    console.log("nBlanks: ", item.nBlanks);
                                    
                                    let txCur = await tx(writeContracts.YourCollectible.addProposal(inputText));
                                  }}
                              >Insert Proposal
                              </Button>            <br />
                              </form>
                              <br />

                            </>}
                              handleClose={toggleProposal}
                          />}
                      </div>
                      {!isClosed && item.owner.toLowerCase() == address.toLowerCase() ? (
                          <div>
                            <Button type="primary" onClick={
                                  async () => {                                   
                                      let txClose = await tx(writeContracts.YourCollectible.closeMadLib(id));
                                  }
                              }>CLOSE PROPOSAL
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