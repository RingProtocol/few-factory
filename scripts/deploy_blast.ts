import { ethers } from "hardhat"

async function deployFewFactory() {
  const [wallet] = await ethers.getSigners()
  console.log("deployer.address: ", wallet.address)

  const fewFactoryFactory = await ethers.getContractFactory('FewFactory')
  const fewFactory = await fewFactoryFactory.deploy('0x6134C466A5054965440f3d8B8CFb58B6b35E739D')
  await fewFactory.deployed()
  console.log("FewFactory address:", await fewFactory.address)
}

async function main() {
  await deployFewFactory()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
