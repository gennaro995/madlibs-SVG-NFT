pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import 'base64-sol/base64.sol';

contract YourCollectible is ERC721Enumerable, Ownable {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  Counters.Counter private _proposalIds;
  uint8 public _maxVotes = 3;
  MadLib[] public _madlibs;
  using Strings for uint256;

  /**
  * @dev
  * Note: 
  *   - words -> parole della proposta
  * Requirements:
  *   -
  *   -
  * Returns:
  *   -
  */
  struct Proposal{
    uint256 id;
    string[] words;
    uint256 countVotes;
    bool done;
  }
 
  /**
  * @dev MadLibs -> NFT
  * Note: 
  *   - L'ho messo come esempio di come si dovrebbe commentare il codice in solidity
  *   -
  * Requirements:
  *   -
  *   -
  * Returns:
  *   -
  */
  struct MadLib{ 
    uint256 id;
    string text;
    uint8 nBlanks;
    mapping(address => Proposal) proposals;
    mapping(address => uint8) addrVotes;
    bool closed;
  }

  


  constructor() ERC721("MadLibs onChain", "MLC") {
  }

  function mintItem(string memory _text, uint8 _nBlanks) public onlyOwner returns (uint256) {
    _tokenIds.increment();
    uint256 id = _tokenIds.current();
    _mint(msg.sender, id);
    _madlibs[id].id = id;
    _madlibs[id].text = _text;
    _madlibs[id].nBlanks = _nBlanks;
    _madlibs[id].closed = false;
    return id;
  }

  /*function getMadLib(uint _id) public view returns(MadLib memory) {  //TODO
    return madlibs[_id]; 
  }*/

   function getProposal(uint _id, address _addr) public view returns(Proposal memory){
    return _madlibs[_id].proposals[_addr]; 
  }

  /*function getProposals(uint _id, address _addr) public view returns(mapping(address => Proposal) memory){ //TODO
    return madlibs[_id].proposals; 
  }*/

  function _addProposal(string[] memory _words) private{ 
    uint256 id = _tokenIds.current();
    require (_madlibs[id].proposals[msg.sender].done == false, "Player already has a proposal for this MadLib!");
    _madlibs[id].proposals[msg.sender].done = true;
    _proposalIds.increment();
    _madlibs[id].proposals[msg.sender].id =  _proposalIds.current();
    //uint256 nBlanks =  _madlibs[id].nBlanks;

    //for (uint i = 0; i < nBlanks; i++) {
      _madlibs[id].proposals[msg.sender].words = _words;
    //}
  }

  function voteProposal(address _idProposal) public{
    uint256 id = _tokenIds.current();
    require (_madlibs[id].closed == false, "Proposal must be for open/current MadLib!");
    _madlibs[id].proposals[_idProposal].countVotes++;
  }

  function tokenURI(uint256 _id) public view override returns (string memory) {
      require(_exists(_id), "not exist");
      string memory title = string(abi.encodePacked('MadLibs #'));
      string memory description = string(abi.encodePacked('This MabLibd Game onChain'));
      string memory image = Base64.encode(bytes(generateSVGofTokenById(_id)));

      return
          string(
              abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                          abi.encodePacked(
                              '{"name":"',
                              title,
                              '", "description":"',
                              description,
                              '", "external_url":"https://burnyboys.com/token/',
                              _id.toString(),
                              '", "owner":"',
                              //(uint160(ownerOf(_id))).toHexString(20),
                              '", "image": "',
                              'data:image/svg+xml;base64,',
                              image,
                              '"}'
                          )
                        )
                    )
              )
          );
  }

  function generateSVGofTokenById(uint256 _id) internal view returns (string memory) {

    string memory svg = string(abi.encodePacked(
      '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">',
        renderTokenById(_id),
      '</svg>'
    ));

    return svg;
  }

  function renderTokenById(uint256 _id) public view returns (string memory) {
      return string(abi.encodePacked(
        '<rect width="99%" height="99%" fill="white" />',
        '<text x="15" y="30" style="fill:black;"> PIPPO' ,
          '<tspan x="15" y="85">LICENSE PLATE: </tspan> PLUTO',
        '</text>'
      ));
    
  }

  // find #x where x is the first letter of a type of word (a->adjective, v -> verb, n-> noun ecc) those will be the mad lips
  /*function processText (string memory _at, MadLib storage session) private {
    bytes memory whatBytes = bytes ("#");
    bytes memory whereBytes = bytes (_at);

    bool found = false;
    for (uint i = 0; i <= whereBytes.length - whatBytes.length; i++) {
        bool flag = true;
        for (uint j = 0; j < whatBytes.length; j++)
            if (whereBytes [i + j] != whatBytes [j]) {
                flag = false;
                break;
            }
        if (flag) {
           found = true;
          session.madLibs[session.nMadLibs] = MadLib({
             typeOfWord: whereBytes[i+1],guessed: false
             });

           session.nMadLibs++;
        }
    }
    require (found);

  }*/


}