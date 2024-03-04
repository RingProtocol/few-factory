import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import "@nomicfoundation/hardhat-verify"
import dotenv from 'dotenv'
dotenv.config()

const privateKey = process.env.ETH_PRIVATE_KEY;

export default {
  paths: {
    sources: "./contracts",
    artifacts: "./build",
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: privateKey ? [privateKey] : [],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: privateKey ? [privateKey] : [],
    },
    blast_sepolia: {
      url: 'https://sepolia.blast.io',
      accounts: privateKey ? [privateKey] : [],
    },
    blast: {
      url: 'https://wandering-greatest-card.blast-mainnet.quiknode.pro/57de2f59e7773d827df7916a6a9080a6d2720a84',
      accounts: privateKey ? [privateKey] : [],
    },
    arbitrumRinkeby: {
      url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    arbitrum: {
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    optimismKovan: {
      url: `https://optimism-kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    bnb: {
      url: `https://bsc-dataseed.binance.org/`,
    },
  },
  // etherscan: {
  //   // Your API key for Etherscan
  //   // Obtain one at https://etherscan.io/
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },
  etherscan: {
    apiKey: {
      blast: process.env.BLASTSCAN_API_KEY, // apiKey is not required, just set a placeholder
    },
    customChains: [
      {
        network: "blast",
        chainId: 81457,
        urls: {
          apiURL: "https://api.blastscan.io/api",
          browserURL: "https://blastscan.io"
        }
      }
    ]
  },
  solidity: {
    version: "0.6.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
      evmVersion: 'istanbul'
    },
  },
}
