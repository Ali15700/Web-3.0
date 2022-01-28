require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity:'0.8.0',
  networks: {
    ropsten: {
        url:'https://eth-ropsten.alchemyapi.io/v2/rdop40sh3aXxyzq473Mfz02C9R8Ku69P',
        accounts:['d6d695b17485a438ddae9620874c0c661d691efa712debf5f639138c43cf2fd2'],
    },
  },
};