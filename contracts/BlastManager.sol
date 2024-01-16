// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.6.6;

import './interfaces/IBlast.sol';
import './interfaces/IBlastPoints.sol';
import './interfaces/IBlastManager.sol';

contract BlastManager is IBlastManager {
    IBlast public constant BLAST = IBlast(0x4300000000000000000000000000000000000002);
    address public override manager;

    modifier onlyManager() {
        require(msg.sender == manager, "FORBIDDEN");
        _;
    }

    constructor() public {
        manager = msg.sender;
        BLAST.configureClaimableGas();
    }

    function claimGas(address recipient, bool isMax) external override onlyManager returns (uint256) {
        if (isMax) {
            return BLAST.claimMaxGas(address(this), recipient);
        } else {
            return BLAST.claimAllGas(address(this), recipient);
        }
    }

    function setManager(address _manager) external override onlyManager {
        manager = _manager;
    }

    function setGasMode(address blastGas) external override onlyManager {
        IBlast(blastGas).configureClaimableGas();
    }

    function setPointsOperator(address blastPoints, address operator) external override onlyManager {
        // This method can be called only once, and operator must be an EOA.
        IBlastPoints(blastPoints).configurePointsOperator(operator);
    }
}
