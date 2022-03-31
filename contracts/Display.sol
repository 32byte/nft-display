// Display.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Display is Ownable {
  IERC20 private _erc20Token;

  uint256 private _tokenId;
  uint256 private _payment;

  constructor(address token) {
    _erc20Token = IERC20(token);

    _tokenId = 0;
    _payment = 0;
  }

  function tokenId() public view returns(uint256) {
    return _tokenId;
  }

  function payment() public view returns(uint256) {
    return _payment;
  }

  function promote(uint256 amount, uint256 newTokenId) public {
    // make sure the caller overpays the last payment
    require(amount > _payment, "You must pay more than the last user");

    // get the allowance of the caller
    uint256 allowance = _erc20Token.allowance(msg.sender, address(this));
    // make sure the allowance is high enough
    require(allowance >= amount, "Allowance not high enough");

    // transfer the amount from the caller to the contract
    _erc20Token.transferFrom(msg.sender, address(this), amount);
    // update internal state
    _payment = amount;
    _tokenId = newTokenId;
  }

  function withdraw() public onlyOwner {
    // get the balance of this contract
    uint256 balance = _erc20Token.balanceOf(address(this));
    require(balance > 0, "You can only withdraw when the contract has more than 0 tokens");

    // transfer balance to owner
    _erc20Token.transfer(owner(), balance);
  }
}