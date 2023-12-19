import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { BigNumber } from 'ethers/utils'

import { expandTo18Decimals, mineBlock, encodePrice } from './shared/utilities'
import FewWrappedToken from '../build/FewWrappedToken.json'

import { AddressZero } from 'ethers/constants'
import FewFactory from '../build/FewFactory.json'
import Core from './shared/contractBuild/Core.json'
import ERC20 from '../build/ERC20.json'

chai.use(solidity)

const overrides = {
  gasLimit: 9999999
}

describe('FewWrappedToken', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()

  let factory: Contract
  let token: Contract
  let core: Contract
  let fewWrappedToken: Contract
  let fewWrappedTokenAddress: string
  before(async () => {
    core = await deployContract(wallet, Core, [], overrides)
    await core.init() // initialize the core

    factory = await deployContract(wallet, FewFactory, [core.address], overrides)
    token = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)], overrides)
    await factory.createToken(token.address)

    fewWrappedTokenAddress = await factory.getWrappedToken(token.address)
    fewWrappedToken = new Contract(fewWrappedTokenAddress, JSON.stringify(FewWrappedToken.abi), provider).connect(
      wallet
    )
  })

  async function wrap(tokenAmount: BigNumber) {
    await token.approve(fewWrappedToken.address, tokenAmount, overrides)
    await fewWrappedToken.wrap(tokenAmount, overrides)
  }

  it('wrap', async () => {
    const tokenAmount = expandTo18Decimals(5)
    await token.transfer(fewWrappedToken.address, tokenAmount, overrides)
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    await token.approve(fewWrappedToken.address, tokenAmount, overrides)

    const expectedLiquidity = expandTo18Decimals(5)
    await expect(fewWrappedToken.wrap(tokenAmount, overrides))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, fewWrappedToken.address, tokenAmount)
      .to.emit(fewWrappedToken, 'Transfer')
      .withArgs(AddressZero, wallet.address, tokenAmount)
      .to.emit(fewWrappedToken, 'Wrap')
      .withArgs(wallet.address, tokenAmount, wallet.address)

    expect(await fewWrappedToken.totalSupply()).to.eq(expectedLiquidity)
    expect(await fewWrappedToken.balanceOf(wallet.address)).to.eq(tokenAmount)
    expect(await token.balanceOf(wallet.address)).to.eq(expandTo18Decimals(10000).sub(tokenAmount.add(tokenAmount)))
    expect(await token.balanceOf(fewWrappedToken.address)).to.eq(tokenAmount.add(tokenAmount))
  })

  async function unwrap(tokenAmount: BigNumber) {
    await fewWrappedToken.approve(fewWrappedToken.address, tokenAmount, overrides)
    await fewWrappedToken.unwrap(tokenAmount, overrides)
  }

  it('unwrap', async () => {
    const tokenAmount = expandTo18Decimals(5)

    await expect(fewWrappedToken.unwrap(tokenAmount, overrides))
      .to.emit(fewWrappedToken, 'Transfer')
      .withArgs(wallet.address, AddressZero, tokenAmount)
      .to.emit(token, 'Transfer')
      .withArgs(fewWrappedToken.address, wallet.address, tokenAmount)
      .to.emit(fewWrappedToken, 'Unwrap')
      .withArgs(wallet.address, tokenAmount, wallet.address)

    expect(await fewWrappedToken.balanceOf(wallet.address)).to.eq(0)
    expect(await fewWrappedToken.totalSupply()).to.eq(0)
    expect(await token.balanceOf(fewWrappedToken.address)).to.eq(tokenAmount)
    const totalSupplyToken = await token.totalSupply()
    expect(await token.balanceOf(wallet.address)).to.eq(totalSupplyToken.sub(tokenAmount))
  })

  it('mint', async () => {
    const targetAddress = other.address

    // Ensure the target address is not a minter initially
    expect(await core.isMinter(targetAddress)).to.equal(false)

    // Grant minter role to the target address
    await core.connect(wallet).grantMinter(targetAddress)

    // Verify that the target address is now a minter
    expect(await core.isMinter(targetAddress)).to.equal(true)

    const tokenAmount = expandTo18Decimals(5)

    await expect(fewWrappedToken.connect(other).mint(targetAddress, tokenAmount))
      .to.emit(fewWrappedToken, 'Mint')
      .withArgs(other.address, tokenAmount, targetAddress)
      .to.emit(fewWrappedToken, 'Transfer')
      .withArgs(AddressZero, targetAddress, tokenAmount)
  })

  it('burn', async () => {
    const targetAddress = other.address

    // Ensure the target address is not a minter initially
    // expect(await core.isMinter(targetAddress)).to.equal(false);

    // // Grant minter role to the target address
    // await core.grantMinter(targetAddress);

    // Verify that the target address is now a minter
    expect(await core.isMinter(targetAddress)).to.equal(true)

    // Ensure the target address is not a burner initially
    expect(await core.isBurner(targetAddress)).to.equal(false)

    // Grant burner role to the target address
    await core.grantBurner(targetAddress)

    // Verify that the target address is now a burner
    expect(await core.isBurner(targetAddress)).to.equal(true)

    const tokenAmount = expandTo18Decimals(5)

    // First, mint some tokens to the target address for burning
    await fewWrappedToken.connect(other).mint(targetAddress, tokenAmount)
    expect(await fewWrappedToken.balanceOf(targetAddress)).to.eq(tokenAmount.add(tokenAmount))

    // Burn the tokens
    await expect(fewWrappedToken.connect(other).burn(tokenAmount))
      .to.emit(fewWrappedToken, 'Burn')
      .withArgs(other.address, tokenAmount, other.address) // Modified the expected arguments here
      .to.emit(fewWrappedToken, 'Transfer')
      .withArgs(other.address, AddressZero, tokenAmount)

    // Ensure the balance is deducted after burning
    expect(await fewWrappedToken.balanceOf(targetAddress)).to.eq(tokenAmount)
  })
})
