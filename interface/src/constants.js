export const supportedChains = [420, 43113, 80001]

export const chainsDetails = {
    420: {
        name: "Optimism",
        image: "https://docs.axelar.dev/images/chains/optimism.svg",
        currency: "ETH",
        network: "",
        apiKey: "",
        contract: "0x910605Cf714973AE054bD82C071EA22daD231Da3",
        destChain: "Optimism",
        destinationChainSelector: "2664363617261496610",
        rpc: "https://endpoints.omniatech.io/v1/op/goerli/public",
        explorer: "https://goerli-optimism.etherscan.io/tx/",
    },
    43113: {
        name: "Avalance",
        image: "https://docs.axelar.dev/images/chains/avalanche.svg",
        currency: "AVAX",
        network: "",
        apiKey: "",
        contract: "0x05606d37bE6e3Cac339311d084EF4C47FCfed77B",
        destChain: "Avalanche",
        destinationChainSelector: "14767482510784806043",
        rpc: "https://api.avax-test.network/ext/bc/C/rpc",
        explorer: "https://testnet.snowtrace.io/tx/",
    },
    80001: {
        name: "Polygon",
        image: "https://polygonscan.com/images/svg/brands/matic.svg",
        currency: "MATIC",
        network: "",
        apiKey: "",
        contract: "0xC21339d4fE97Dd9dE5E277dac6df61A16BB80043",
        destChain: "Polygon",
        destinationChainSelector: "12532609583862916517",
        rpc: "https://rpc-mumbai.maticvigil.com",
        explorer: "https://mumbai.polygonscan.com/tx/",
    }
}