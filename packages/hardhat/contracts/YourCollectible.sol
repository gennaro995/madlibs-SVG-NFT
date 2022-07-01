pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import 'base64-sol/base64.sol';
import './HexStrings.sol';

contract YourCollectible is ERC721Enumerable, Ownable {

  using Strings for uint256;
  using HexStrings for uint160;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // all funds go to buidlguidl.eth
  address payable public constant recipient = payable(0xa81a6a910FeD20374361B35C451a4a44F86CeD46);
  uint256 public price = 0.001 ether;

  mapping (uint256 => string) public license_plate;
  mapping (uint256 => bool) public filled;
  mapping (uint256 => uint256) public km;
  mapping (uint256 => uint256) public car_services_done;
  mapping (uint256 => mapping (uint256 => uint256)) public km4service; //km done at car service moment -> car km history
  mapping (uint256 => mapping (uint256 => string)) public note4service; //km done at car service moment -> car km history
  mapping (uint256 => string) public chassis_number; //cars ID
  mapping (uint256 => string) public manufacturer;
  mapping (uint256 => string) public model;
  mapping (uint256 => string) public production_year;
  mapping (uint256 => uint256) public past_owners;

  event CarServiceDone(address indexed sender, string message);

  

  constructor() public ERC721("Car Certification onChain", "CCC") {
  }

  function mintItem() public payable returns (uint256){
    require(msg.value >= price, "NOT ENOUGH");
    _tokenIds.increment();

    uint256 id = _tokenIds.current();
    _mint(msg.sender, id);
    filled[id] = false;
    (bool success, ) = recipient.call{value: msg.value}("");
    require(success, "could not send");

    return id;
  }

  function fillCCC(uint256 _tokenId, string memory _license_plate, string memory _chassis, string memory _manufacturer, string memory _model, string memory _year) public{

    require(ownerOf(_tokenId) == msg.sender, "you aren't the owner");

    license_plate[_tokenId] = _license_plate;
    km[_tokenId] = 0;
    car_services_done[_tokenId] = 0;
    past_owners[_tokenId] = 0;
    chassis_number[_tokenId] = _chassis;
    manufacturer[_tokenId] = _manufacturer;
    model[_tokenId] = _model;
    production_year[_tokenId] = _year;
    filled[_tokenId] = true;
  }

  function makeCarService(uint256 _updated_km, uint256 _tokenId, string memory _message4services) public{

    require(ownerOf(_tokenId) == msg.sender, "you aren't the owner");
    require(_updated_km > km[_tokenId], "km can not be decreased");
    
    km[_tokenId] = _updated_km;
    car_services_done[_tokenId] += 1;
    km4service[_tokenId][car_services_done[_tokenId]] = _updated_km;
    note4service[_tokenId][car_services_done[_tokenId]] = _message4services;
    emit CarServiceDone(msg.sender, "Car Service completed!");
  }

  function tokenURI(uint256 id) public view override returns (string memory) {
      require(_exists(id), "not exist");
      string memory name = string(abi.encodePacked('CCC #',id.toString()));
      string memory description = string(abi.encodePacked('This is Car Certification onChain'));
      string memory image = Base64.encode(bytes(generateSVGofTokenById(id)));

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
                              id.toString(),
                              '", "owner":"',
                              (uint160(ownerOf(id))).toHexString(20),
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

  function generateSVGofTokenById(uint256 id) internal view returns (string memory) {

    string memory svg = string(abi.encodePacked(
      '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">',
        renderTokenById(id),
      '</svg>'
    ));

    return svg;
  }

  function renderTokenById(uint256 _id) public view returns (string memory) {

    if(filled[_id] == true){
      return string(abi.encodePacked(

        '<rect width="100%" height="100%" fill="', badgeColor(past_owners[_id]) ,'" />',
        '<rect width="99%" height="99%" fill="black" />',
        //'<text x="0" y="15" fill="white">I love SVG! Targa:', targa[id] ,'</text>'
        '<text x="15" y="30" style="fill:white;"> ' ,manufacturer[_id], ' ', model[_id], ' ',
          '<tspan x="15" y="85">LICENSE PLATE: </tspan>', license_plate[_id], 
          '<tspan x="15" y="110">CHASSIS #: </tspan>', chassis_number[_id],
          '<tspan x="15" y="135">YEAR: </tspan>', production_year[_id],
          '<tspan x="15" y="160">KILOMETRES: </tspan>', uint2str(km[_id]),
          '<tspan x="15" y="185">SERVICES DONE: </tspan>', uint2str(car_services_done[_id]),
          '<tspan x="15" y="210">PAST OWNERS: </tspan>', uint2str(past_owners[_id]),
        '</text>'
      ));
    }else{
      return string(abi.encodePacked(
        '<rect width="100%" height="100%" fill="blue" />',
        '<rect width="99%" height="99%" fill="white" />',
        '<text x="15" y="30" style="fill:blue;"> CLEAN CCC IS MINTED!',
        '<tspan x="15" y="85">PLEASE FILL CCC</tspan>',
        '<tspan x="15" y="110">UNDER DEBUG CONTRACT TAB</tspan>',
        '<tspan x="15" y="135">WITH ALL INFO RELATED</tspan>',
        '</text>'
      ));
    }
  }

  function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
      if (_i == 0) {
          return "0";
      }
      uint j = _i;
      uint len;
      while (j != 0) {
          len++;
          j /= 10;
      }
      bytes memory bstr = new bytes(len);
      uint k = len;
      while (_i != 0) {
          k = k-1;
          uint8 temp = (48 + uint8(_i - _i / 10 * 10));
          bytes1 b1 = bytes1(temp);
          bstr[k] = b1;
          _i /= 10;
      }
      return string(bstr);
  }

  function badgeColor(uint _past_owner) internal pure returns (string memory) {
    if (_past_owner == 0) {
      return "gold";
    }else if (_past_owner >= 1 && _past_owner <= 3) {
      return "silver";
    }else {
      return "orange";
    }
      
  }

  function _transfer(address from, address to, uint256 tokenId) internal override(ERC721){
    past_owners[tokenId] += 1;
    ERC721._transfer(from, to, tokenId);
  }
}