// NFT.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import openzeppelin libraries to make our life easier
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// the NFT contract
contract NFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    // have a counter for the token ids
    // which is incremented each time a NFT is minted
    Counters.Counter private _tokenIds;

    // make sure to edit the NAME and SYMBOL
    constructor() ERC721("NAME", "SYMBOL") {}

    function mintNFT(string memory imageURI)
        public
        returns (uint256)
    {
        // increase the token ids
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        // mint a new NFT to the caller
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, imageURI);

        return newItemId;
    }
}