
import { useState } from 'react';
import { useAccount, useBalance, useWalletClient, usePublicClient } from 'wagmi'
import { chainsDetails } from '../constants';
import { ethers } from "ethers";
import { useAlert, positions } from 'react-alert';
import gasABI from "./../gasABI.json";
import { QRCode } from "react-qr-code";
import { Circle, CircleEnvironments, PaymentIntentCreationRequest } from "@circle-fin/circle-sdk";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TransferDetailsFlap({toChain, chain}) {

    const {address} = useAccount()
    const { data: signer } = useWalletClient();
    const provider = usePublicClient();

    const [inputAmount, setInputAmount] = useState(0);
    const [receiveAmount, setReceiveAmount] = useState(0);
    const [lpFees, setLpFees] = useState(0);
    const [bridgeFees, setBridgeFees] = useState(0);
    const [bridgeFeesMatic, setBridgeFeesMatic] = useState(0);
    const [payAmount, setPayAmount] = useState(0);
    const [payUSDAmount, setPayUSDAmount] = useState(0);
    const [payMaticAmount, setPayMaticAmount] = useState(0);
    const [loading, setloading] = useState(false);
    const [payAddress, setPayAddress] = useState("");
    const [showQR, setShowQR] = useState(false);
    const [payInCeloLoading, setPayInCeloLoading] = useState(false)
    const [payInUSDCLoading, setPayInUSDCLoading] = useState(false)
    const [checkStatusLoading, setCheckStatusLoading] = useState(false)
    const [paymentId, setPaymentId] = useState("")
    const alert = useAlert()
    const notifyPaymentNotReceived = () => toast.info('Payment not received yet!', {
        position: toast.POSITION.BOTTOM_LEFT
    });
    const notifyPaymentReceived = () => toast.success('Payment received!', {
        position: toast.POSITION.BOTTOM_LEFT
    });

    const { data } = useBalance({
        address:address
    })

    const circle = new Circle(
        process.env.REACT_APP_CIRCLE_SECRET_KEY,
        CircleEnvironments.sandbox  
    );

    const estimateAmount = async (val) => {
        if(val > 0) {
            setloading(true)
            setInputAmount(val)
            const _provider1 = new ethers.JsonRpcProvider(chainsDetails[toChain].rpc);
            const _gasContract1 = new ethers.Contract(chainsDetails[toChain].contract, gasABI, _provider1);
            let toConversionRate = await _gasContract1.getLatestData();

            const _provider2 = new ethers.JsonRpcProvider(chainsDetails[chain.id].rpc);
            const _gasContract2 = new ethers.Contract(chainsDetails[chain.id].contract, gasABI, _provider2);
            let fromConversionRate = await _gasContract2.getLatestData();
            let [transferAmt, lpFee] = await _gasContract2.getFee(ethers.parseUnits(val.toString(), "ether"));
            setLpFees(ethers.formatEther(lpFee));

            const _receiveAmount = +parseFloat(ethers.formatEther((fromConversionRate * transferAmt)/toConversionRate)).toFixed(4)
            setReceiveAmount(_receiveAmount)

            // let _bridgeFees = (0.3 * (0.35 * 100000000)) / Number(fromConversionRate)
            let _bridgeFees = 0
            setBridgeFees(_bridgeFees)

            setPayAmount(Number(_bridgeFees) + Number(val))

            const _provider3 = new ethers.JsonRpcProvider(chainsDetails[80001].rpc);
            const _gasContract3 = new ethers.Contract(chainsDetails[80001].contract, gasABI, _provider3);
            let conversionRate = await _gasContract3.getLatestData();
            const _sourcePayAmount = (Number(_bridgeFees) + Number(val)) * Number(fromConversionRate) * (1/100000000)
            const _sourcePayMaticAmount = (Number(_bridgeFees) + Number(val)) * Number(fromConversionRate) * (1/Number(conversionRate))
            setPayUSDAmount(+parseFloat(_sourcePayAmount).toFixed(2))
            setPayMaticAmount(+parseFloat(_sourcePayMaticAmount).toFixed(2))
            setBridgeFeesMatic((0.3 * (0.35 * 100000000)) / Number(conversionRate))
            setloading(false)
        } else {
            setLpFees(0)
            setReceiveAmount(0)
            setInputAmount(0)
            setBridgeFees(0)
            setBridgeFeesMatic(0)
            setPayAmount(0)
            setPayUSDAmount(0)
            setPayMaticAmount(0)
        }
    }

    const initiate = async () => {
        setPayInCeloLoading(true)
        if(inputAmount > 0) {
            const _provider = new ethers.JsonRpcProvider(chainsDetails[toChain].rpc);
            let contractBalance = ethers.formatEther(await _provider.getBalance(chainsDetails[toChain].contract));
            
            if(contractBalance >= receiveAmount) {
                try {
                    const gasContract = new ethers.Contract(chainsDetails[chain.id].contract, gasABI, provider);
                    const signedContract = gasContract.connect(signer)

                    const gasFee = await provider.getGasPrice(); 
                    const gasFeeFormatted = ethers.formatEther(Number(gasFee) * 100000);
                    console.log(ethers.parseUnits((Number(inputAmount) + Number(gasFeeFormatted)).toString(), "ether"))
                    const txnReceipt = await signedContract.bridgeGas(chainsDetails[toChain].destinationChainSelector, chainsDetails[toChain].contract, {value: ethers.parseUnits(Number(payAmount).toString(), "ether")});
                    console.log(txnReceipt.hash);
                    alert.success(
                        <div>
                            <div>transaction sent</div>
                            <button className='text-xs' onClick={()=> window.open("https://ccip.chain.link/msg/" + txnReceipt.hash, "_blank")}>View on explorer</button>
                        </div>, {
                        timeout: 6000,
                        position: positions.BOTTOM_RIGHT
                    });
                } catch(e) {
                    alert.error(<div>something went wrong</div>, {
                        timeout: 6000,
                        position: positions.BOTTOM_RIGHT
                    });
                }
            } else {
                alert.error(<div>insufficient liquidity on destination chain</div>, {
                    timeout: 6000,
                    position: positions.BOTTOM_RIGHT
                });
            }
        }
        setPayInCeloLoading(false)
    }

    // Create promise that gets resolved in time milliseconds
    function delay(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    async function getPaymentIntent(paymentInentId) {
        const resp = await circle.cryptoPaymentIntents.getPaymentIntent(paymentInentId);

        return resp.data;
    }

    async function pollPaymentIntent(paymentIntentId) {
        const paymentInentId = paymentIntentId;
        const pollInterval = 500;       // Interval (in ms) by which to poll

        let resp = undefined;
        while (true) {
            resp = await getPaymentIntent(paymentInentId);
            console.log("Intent :", resp.data)
            let depositAddress = resp.data?.paymentMethods[0].address;

            if (depositAddress) break;
            await delay(pollInterval); 
        }
        return resp.data?.paymentMethods[0].address;
    }

    async function createCryptoPayment() {
        console.log(String(payUSDAmount))
        const reqBody = {
            amount: {
                amount: String(payUSDAmount),
                currency: "USD"
            },
            settlementCurrency: "USD",
            paymentMethods: [
                {
                    type: "blockchain",
                    chain: "MATIC"
                }
            ],
            idempotencyKey: crypto.randomUUID()
        };
        const resp = await circle.cryptoPaymentIntents.createPaymentIntent(reqBody);
        console.log(resp.data);
        return resp.data;
    }

    const initiateCircle = async () => {
        setPayInUSDCLoading(true)
        if(inputAmount > 0) {
            const data = await createCryptoPayment();
            let _paymentAddress = await pollPaymentIntent(data?.data.id);
            setShowQR(true)
            setPayAddress(_paymentAddress)
            setPaymentId(data?.data.id)
        }
        setPayInUSDCLoading(false)
    }

    async function pollPaymentSuccess(paymentIntentId) {
        const paymentInentId = paymentIntentId;
        let status = false;

        let resp = await getPaymentIntent(paymentInentId);

        console.log(resp.data)

        if(+parseFloat(resp.data?.amountPaid.amount).toFixed(2) >= +parseFloat(payUSDAmount).toFixed(2)) {
            status = true;
        }

        console.log(status)

        return status;
    }

    const checkPaymentStatus = async () => {
        console.log(process.env.REACT_APP_YOUR_API_KEY)
        setCheckStatusLoading(true)
        console.log(paymentId)
        if(paymentId.length > 0) {
            let status = await pollPaymentSuccess(paymentId)
            if(status) {
                notifyPaymentReceived();
                try {
                    const _provider2 = new ethers.JsonRpcProvider(chainsDetails[80001].rpc);
                    const _signer = new ethers.Wallet(process.env.REACT_APP_CIRCLE_CONTRACT, _provider2);
                    const _gasContract = new ethers.Contract(chainsDetails[80001].contract, gasABI, _signer);
                    const txnReceipt = await _gasContract.bridgeGas(chainsDetails[toChain].destChain, chainsDetails[toChain].contract, address, ethers.parseUnits((bridgeFeesMatic).toString(), "ether"), {value: ethers.parseUnits(Number(payMaticAmount).toString(), "ether")});
                    alert.success(
                        <div>
                            <div>transaction sent</div>
                            <button className='text-xs' onClick={()=> window.open("https://ccip.chain.link/msg/" + txnReceipt.hash, "_blank")}>View on explorer</button>
                        </div>, {
                        timeout: 6000,
                        position: positions.BOTTOM_RIGHT
                    });
                    setShowQR(false)
                } catch(e) {
                    console.log(e)
                    alert.error(<div>something went wrong</div>, {
                        timeout: 6000,
                        position: positions.BOTTOM_RIGHT
                    });
                }
                
            } else {
                notifyPaymentNotReceived();
            }
        }
        setCheckStatusLoading(false)
    }

    return (
        toChain !== "" ? 
        <div className='flex justify-center'>
            {showQR ? 
                <div className='flex flex-col items-center absolute bg-white text-white border border-2 border-yellow-100 w-[400px] h-5/6'>
                    <div onClick={() => setShowQR(false)} className='flex absolute justify-end w-11/12 cursor-pointer'><div className='rounded text-[#E6FB04] hover:bg-slate-900 mt-2'><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></div></div>
                    <QRCode className="w-30 h-30 mt-6" value={payAddress} />
                    <div className='flex flex-col items-center my-4 text-black font-semibold text-sm space-y-1'>
                        <div>Network: Matic</div>
                        <div>Payable Amount: {payUSDAmount} USDC</div>
                        <button onClick={() => checkPaymentStatus()} className='flex justify-center rounded px-6 py-2 bg-[#E6FB04] w-[140px]'>
                            {
                                checkStatusLoading ?
                                <svg class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                : <div> Check Status</div>
                            }
                        </button>
                    </div>
                    <div className='text-black text-sm text-gray-400'> Powered By Circle</div>
                </div> : ""}  
            <div className='flex-col justify-between rounded bg-white border text-black p-4 space-y-4 w-full'> 
                <div className='rounded-lg flex items-center justify-center space-x-4 bg-gray-100 py-6 px-4'>
                    <div className='flex-none'>
                        <div className='flex items-center space-x-2'>
                            <img className='w-8 h-8' src={chainsDetails[chain.id].image}/>
                            <div className='font-semibold'>{chainsDetails[chain.id].name}</div>
                        </div>
                    </div>
                    <div className='grow flex items-center justify-between space-x-4'>
                        <div className='outline-dashed w-full'></div>
                        <div className='flex justify-center items-center space-x-2 w-[160px]'>
                            <img className='w-8 h-8' src="https://etherscan.io/token/images/chainlinktoken_32.png?v=6"/>
                            {/* <div className='font-semibold'>CCIP</div> */}
                        </div>
                        <div className='outline-dashed w-full'></div>
                    </div>
                    <div className='flex-none'>
                        <div className='flex items-center space-x-2'>
                            <img className='w-8 h-8' src={chainsDetails[toChain].image}/>
                            <div className='font-semibold'>{chainsDetails[toChain].name}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='flex w-full justify-end text-gray-400 text-sm'> Your {chainsDetails[chain.id].currency} balance: {+parseFloat(data?.formatted).toFixed(4)}</div>
                    <div>
                        <input key="inputBox" onChange={(e) => {estimateAmount(e.target.value)}} type="number" className='w-full px-4 py-[18px] rounded-[8px] bg-gray-100 border-slate-300 text-md shadow-sm focux:bg-white focus:outline-none focus:border-2 focus:border-blue-600 focus:ring-1 focus:ring-sky-500' />
                    </div>
                </div>
                <div className='flex-col w-full justify-center items-center text-gray-500 text-xs font-semibold'>
                    <div className='flex justify-end'><div className='flex items-center text-gray-400 px-2 '>LP Fee: </div> {loading ? <div className='animate-pulse w-[30px] h-[14px] bg-gray-300 mr-1 opacity-5'></div> : +parseFloat(lpFees).toFixed(8)} {chainsDetails[chain.id].currency} </div>
                    {/* <div className='flex justify-end'><div className='flex items-center text-gray-400 px-2'>Bridge Fee: </div> {loading ?<div className='border animate-pulse w-[30px] h-[14px] bg-gray-300 mr-1 opacity-5'></div> : +parseFloat(bridgeFees).toFixed(4)} {chainsDetails[chain.id].currency} </div> */}
                    <div className='flex justify-end '><div className='flex items-center text-gray-400 px-2'>You Pay: </div> {loading ?<div className='animate-pulse w-[30px] h-[14px] bg-gray-300 mr-1 opacity-5'></div> : +parseFloat(payAmount).toFixed(4)} {chainsDetails[chain.id].currency} / {loading ?<div className='animate-pulse w-[30px] h-[14px] bg-gray-300 mx-1 opacity-5'></div> : +parseFloat(payUSDAmount).toFixed(4)} USDC </div>
                    <div className='flex justify-end'><div className='flex items-center text-gray-400 px-2'>You Receive: </div> {loading ?<div className='animate-pulse w-[30px] h-[14px] bg-gray-300 mr-1 opacity-5'></div> : +parseFloat(receiveAmount).toFixed(4)} {chainsDetails[toChain].currency} </div>
                </div>
                <div className='flex w-full justify-center space-x-24'>
                    {/* <button onClick={() => initiateCircle()} className='flex flex-col items-center rounded-lg p-4 px-8 bg-[#E6FB04] font-semibold w-[180px]'>
                        {
                            payInUSDCLoading ?
                            <svg class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            : <div> Pay In USDC </div>
                        }
                    </button> */}
                    <button onClick={() => initiate()} className='flex flex-col items-center rounded-lg p-4 px-8 bg-[#E6FB04] font-semibold w-[180px]'>
                        {
                            payInCeloLoading ?
                            <svg class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            // : <div> Pay In {chainsDetails[chain.id].currency} </div> 
                            :<div> Initiate </div>
                        }
                        
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div> : ""
    )
}

export default TransferDetailsFlap;