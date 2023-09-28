export const supportedChains = [420, 43113, 80001]

export const chainsDetails = {
    420: {
        name: "Optimism",
        image: "https://docs.axelar.dev/images/chains/optimism.svg",
        currency: "ETH",
        network: "",
        apiKey: "",
        contract: "0xe73a205f0205dc0422d4efb27b458c567cb529b8",
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
        contract: "0xe73a205f0205dc0422d4efb27b458c567cb529b8",
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
        contract: "0xe73a205f0205dc0422d4efb27b458c567cb529b8",
        destChain: "Polygon",
        destinationChainSelector: "12532609583862916517",
        rpc: "https://rpc-mumbai.maticvigil.com",
        explorer: "https://mumbai.polygonscan.com/tx/",
    }
}