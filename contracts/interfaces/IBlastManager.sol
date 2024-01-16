// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

interface IBlastManager {
    function manager() external view returns (address);
    function claimGas(address recipient, bool isMax) external returns (uint256);
    function setManager(address _manager) external;
    function setGasMode(address blastGas) external;
    function setPointsOperator(address blastPoints, address operator) external;
}
