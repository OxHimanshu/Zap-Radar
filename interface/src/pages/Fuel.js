import { useAccount, useNetwork } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { supportedChains, chainsDetails } from '../constants';
import TransferDetailsFlap from '../components/TransferDetailsFlap';

function Fuel () {
    
    const {isConnected} = useAccount()
    const {chain} = useNetwork()

    const[toChain, setToChain] = useState("")
    const[toggleChainList, setToggleChainList] = useState(false)

    useEffect(() => {
        if(isConnected) {
        }
    },[isConnected])

    useEffect(() => {
        setToChain("")
    },[chain?.id])

    let Chainselect = () => {
        return (
        toggleChainList ? 
        <div className='drop-shadow-md bg-black rounded-lg absolute h-[450px] w-full text-white px-4'>
            <div className='w-full flex justify-end py-2'>
               <div onClick={() => setToggleChainList(!toggleChainList)} className='cursor-pointer rounded-lg p-2 hover:bg-gray-800'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></div>
            </div>
            <div className='overflow-y-auto h-4/5'>
            {supportedChains.filter(chainId => chainId !== chain.id).map(chainId => {
                let chainDetail = chainsDetails[chainId]
                return (
                    <div onClick={() => {setToChain(chainId); setToggleChainList(!toggleChainList);}} className='cursor-pointer hover:bg-gray-900 flex w-full h-16 items-center px-2 space-x-4'>
                        <img alt="" src={chainDetail.image} className="w-10 h-10"/>
                        <div className='text-xl'>{chainDetail.name}</div>
                    </div>
                )
            })}
            </div>
        </div> : ""
        )
    }

    if(!isConnected || !supportedChains.includes(chain.id)) {
        return (
            <div className='w-full h-5/6 flex items-center justify-center'>
                <ConnectButton chainStatus="icon" showBalance={false}/>
            </div>
        )
    } else {
        return (
            <div className="text-white flex flex-col w-full h-[700px] items-center">
                <div className='h-1/4 flex items-end justify-center text-5xl py-10'>One stop solution for all your gas needs</div>
                <div className='relative h-3/4 w-2/4 flex items-center justify-center'>
                    <div>
                        <div className='border p-4 rounded-lg border-[#E6FB04] border-2 bg-gray-900 space-y-4'>
                            <div className='flex'>
                                <div className='cursor-not-allowed flex justify-center w-[250px] items-center px-2 rounded-lg bg-sky-700 font-semibold overflow-hidden'>{chainsDetails[chain.id].name}</div>
                                <div className='font-light text-md text-gray-500 flex items-center mx-4 '>------</div>
                                <img alt="" src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAuMjg5MDYyIDIzLjk2NTdMMTcuNzU5OSAyMC4wMjczTDI5LjU5MjggMjMuOTY1N0gwLjI4OTA2MloiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8zMjY3XzMwMTkpIi8+CjxwYXRoIGQ9Ik0wLjI4OTA2MiAyMy45NjQ4TDE3Ljc4MjcgMjcuOTAzMkwyOS41OTI4IDIzLjk2NDhIMC4yODkwNjJaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfMzI2N18zMDE5KSIvPgo8cGF0aCBkPSJNNS45NjA5NCAwTDE3Ljc1OTcgMjAuMDI2OUwyOS41OTI3IDIzLjk2NTRMNS45NjA5NCAwWiIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzMyNjdfMzAxOSkiLz4KPHBhdGggZD0iTTYuMDE5NTMgNDcuOTk5NUwxNy43ODQyIDI3LjkwMzJMMjkuNTk0NCAyMy45NjQ4TDYuMDE5NTMgNDcuOTk5NVoiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcl8zMjY3XzMwMTkpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMzI2N18zMDE5IiB4MT0iMTguNDk5MyIgeTE9IjE4LjkxMjciIHgyPSIxOC43NDk0IiB5Mj0iMjIuMTczOSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRDRDRUM0Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZCRjlGNiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfMzI2N18zMDE5IiB4MT0iMjEuNTUzOCIgeTE9IjMwLjEzNSIgeDI9IjIxLjY2MzUiIHkyPSIzMC41Mjg5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNENENFQzQiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkJGOUY2Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQyX2xpbmVhcl8zMjY3XzMwMTkiIHgxPSItMTMuNDMyNSIgeTE9IjguODU2NzYiIHgyPSItMTAuNjk0NSIgeTI9IjAuOTc3NjkyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNENENFQzQiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkJGOUY2Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8zMjY3XzMwMTkiIHgxPSIxNi41NjgzIiB5MT0iMzkuOTY5MSIgeDI9IjE2LjAxNzIiIHkyPSIyOC4wOTk3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNENUNFQzQiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkJGOUY2Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==' />
                                <div className='font-light text-md text-gray-500 flex items-center mx-4'>------</div>
                                <div onClick={() => setToggleChainList(!toggleChainList)} className='flex flex-row flex justify-center w-[250px] items-center px-2 rounded-lg bg-sky-700 active:bg-sky-800'>
                                    <button className={`w-11/12 font-semibold overflow-hidden active ${toChain === "" ? "text-gray-300" : "text-white"}`}>{toChain === '' ? "Destination" : chainsDetails[toChain].name}</button>
                                    <div className='w-1/12'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></div>
                                </div>
                            </div>
                            <TransferDetailsFlap toChain={toChain} chain={chain}/>
                        </div>
                    </div>
                    <Chainselect/>
                </div>
                <div className='flex flex-col w-full items-center justify-center'>
                    <div className='flex flex-col items-center justify-center py-2 space-y-2'>
                        {toChain !== "" ? <div className='border w-[600px] border-dashed border-gray-200'></div> : ""}
                        <div className='flex border border-black border-2 justify-center w-[720px] rounded py-2 bg-[#E6FB04] text-black font-semibold'>
                            Disclaimer: 20% - 50% of the bridge fees will be refunded to the user automatically
                        </div>  
                    </div>
                </div>
            </div>
        )
    }
}

export default Fuel;