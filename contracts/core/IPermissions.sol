// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Permissions interface
interface IPermissions {
    // ----------- Getters -----------

    function isBurner(address _address) external view returns (bool);

    function isMinter(address _address) external view returns (bool);

    function isGovernor(address _address) external view returns (bool);

    function isGuardian(address _address) external view returns (bool);
}
