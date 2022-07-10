pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import 'base64-sol/base64.sol';
import './HexStrings.sol';

contract YourCollectible is ERC721Enumerable, Ownable {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  Counters.Counter private _proposalIds;
  uint8 public _maxVotes = 3;
  MadLib[] public _madlibs;
  using Strings for uint256;
  using HexStrings for uint160;
   // all funds go to buidlguidl.eth
  address payable public constant recipient = payable(0xa81a6a910FeD20374361B35C451a4a44F86CeD46);
  uint256 public price = 0.001 ether;

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
    string[] words;
    uint256 countVotes;
    address proposer;
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
    Proposal[] proposals;
    mapping(address => bool) addrProposed;
    mapping(address => uint8) addrVotes;
    bool closed;
  }

  constructor() ERC721("MadLibs onChain", "MLC") {
  }

  function mintItem(string memory _text, uint8 _nBlanks) public payable returns (uint256) {
    if(0 != _madlibs.length)
        require(_madlibs[_madlibs.length-1].closed, "Previous MadLib not closed yet!");
    uint256 id = _tokenIds.current();
    _mint(msg.sender, id);
    MadLib storage item2mint = _madlibs.push();
    item2mint.id = id;
    item2mint.text = _text;
    item2mint.nBlanks = _nBlanks;
    item2mint.closed = false;
    return id;
  }

  function closeMadLib(uint _id) public {//TODO solo owner dell'nft
    require(_madlibs[_tokenIds.current()].closed == false, "Selected MadLib already closed!");
    _madlibs[_id].closed = true;
    _tokenIds.increment();
  }

   function getProposal(uint _id, uint _idProposal) public view returns(Proposal memory){
    return _madlibs[_id].proposals[_idProposal]; 
  }

  function getProposals(uint _id) public view returns(Proposal[] memory){
    return _madlibs[_id].proposals; 
  }

  function addProposal(string[] memory _words) public{ 
    uint256 id = _tokenIds.current();
    require (_madlibs[id].addrProposed[msg.sender] == false, "Player already has a proposal for this MadLib!");
    require (_words.length == _madlibs[id].nBlanks, "not right number of words!");
    _madlibs[id].addrProposed[msg.sender] = true;

    Proposal storage currentProposal = _madlibs[id].proposals.push();
    currentProposal.proposer = msg.sender;
    currentProposal.words = _words;
  }

  function voteProposal(uint _idProposal) public{
    uint256 id = _tokenIds.current();
    require (_madlibs[id].closed == false, "Proposal must be for open/current MadLib!");
    require (_madlibs[id].addrVotes[msg.sender] < _maxVotes , "Proposal must be for open/current MadLib!");
    _madlibs[id].addrVotes[msg.sender]++;
    _madlibs[id].proposals[_idProposal].countVotes++;
  }

  function tokenURI(uint256 _id) public view override returns (string memory) {
      require(_exists(_id), "Not exist!");
      string memory name = string(abi.encodePacked('MadLib #',_id.toString()));
      string memory description = string(abi.encodePacked('This is MabLibs Game onChain'));
      string memory image = Base64.encode(bytes(generateSVGofTokenById(_id)));

      return
          string(
              abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                          abi.encodePacked(
                              '{"name":"',
                              name,
                              '", "description":"',
                              description,
                              '", "external_url":"https://burnyboys.com/token/',
                              _id.toString(),
                              '", "owner":"',
                              (uint160(ownerOf(_id))).toHexString(20),
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
      //'<text x="0" y="15" fill="white">I love SVG! Targa:', targa[id] ,'</text>'
      '<text x="15" y="30" style="fill:black;"> ' ,_madlibs[_id].text,' ',
        '<tspan x="15" y="85">XXXXX </tspan> XXXX',
      '</text>'
    ));
  }

}