// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.6.6;

import './interfaces/IFewFactory.sol';
import './refs/CoreRef.sol';
import './FewWrappedToken.sol';

contract FewFactory is IFewFactory, CoreRef {
    mapping(address => address) public override getWrappedToken;
    address[] public override allWrappedTokens;
    address public override parameter;

    event WrappedTokenCreated(address indexed originalToken, address wrappedToken, uint);

    constructor(address coreAddress) CoreRef(coreAddress) public {}

    function allWrappedTokensLength() external override view returns (uint) {
        return allWrappedTokens.length;
    }

    function paused() public override(IFewFactory, Pausable) view returns (bool) {
        return super.paused();
    }

    function createToken(address originalToken) external override returns (address wrappedToken) {
        require(originalToken != address(0));
        require(getWrappedToken[originalToken] == address(0)); // single check is sufficient

        parameter = originalToken;
        wrappedToken = address(new FewWrappedToken{salt: keccak256(abi.encode(originalToken))}());
        delete parameter;

        getWrappedToken[originalToken] = wrappedToken;
        allWrappedTokens.push(wrappedToken);
        emit WrappedTokenCreated(originalToken, wrappedToken, allWrappedTokens.length);
    }
}
