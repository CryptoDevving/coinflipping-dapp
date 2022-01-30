const HDWalletProvider = require("truffle-hdwallet-provider");
const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: "localhost",
      port: 8545,
      network_id: '*'
    },
    ropsten:{
      provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://ethereum-ropsten-rpc.allthatnode.com/" + process.env.DSRV_API_KEY),
      network_id: 3,
      gas: 3000000,
      gasPrice: 10000000000
    },
    main: {
      provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://ethereum-mainnet-rpc.allthatnode.com/" + process.env.DSRV_API_KEY),
      network_id: 1,
      gas: 975432,
      gasPrice: 122000000000
    }
  }
};
