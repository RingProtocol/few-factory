import { Wallet, Contract } from 'ethers'
import { Web3Provider } from 'ethers/providers'
import { deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import FewFactory from '../../build/FewFactory.json'

import FewWrappedToken from '../../build/FewWrappedToken.json'

import ERC20 from '../../build/ERC20.json'

interface FactoryFixture {
  factory: Contract
}

const overrides = {
  gasLimit: 9999999
}

export async function factoryFixture(_: Web3Provider, [wallet]: Wallet[]): Promise<FactoryFixture> {
  const factory = await deployContract(wallet, FewFactory, [wallet.address], overrides)
  return { factory }
}

interface FewWrappedTokenFixture extends FactoryFixture {
  token: Contract
  fewWrappedToken: Contract
}

export async function fewWrappedTokenFixture(provider: Web3Provider, [wallet]: Wallet[]): Promise<FewWrappedTokenFixture> {
  const { factory } = await factoryFixture(provider, [wallet])

  const token = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)], overrides)

  await factory.createToken(token.address, overrides)
  const fewWrappedTokenAddress = await factory.getWrappedToken(token.address)
  const fewWrappedToken = new Contract(fewWrappedTokenAddress, JSON.stringify(FewWrappedToken.abi), provider).connect(wallet)

  return { factory, token, fewWrappedToken }
}
