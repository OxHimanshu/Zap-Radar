import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavLink as Link } from 'react-router-dom';
import lightning from '../lightning.png';

function Navbar () {
    return (
        <div className="flex items-center justify-between w-full h-20 px-6 border-b-2 border-[#E6FB04] text-[#E6FB04]">
            <Link className="flex flex-row items-center space-x-2" to='/'>
                <img src="https://imgs.search.brave.com/LoGqhF6z_DFktoCKzkklFomn3YRKBSpz5Z5VC6UOCxc/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9jZG4w/Lmljb25maW5kZXIu/Y29tL2RhdGEvaWNv/bnMvY2lyY2xlLWlj/b25zLzY0L3JhZGFy/LnBuZw" className="w-10 h-10" alt=""/>
                <div className="font-semibold md:text-3xl text-2xl" to='/'>Zap Radar</div>
            </Link>
            <div className="space-x-8 sm:space-x-24 md:space-x-40 lg:space-x-72">
                <Link className="font-semibold hover:font-bold" to='/'>Refill</Link>
                <Link className="font-semibold hover:font-bold" to='/dashboard'>Earn</Link>
                {/* <Link className="font-normal hover:font-bold text-md" to='/earn'>Earn</Link>  */}
            </div>
            <div className="">
                <ConnectButton chainStatus="icon" showBalance={false} accountStatus="avatar"/>
            </div>
        </div>
    )
}

export default Navbar;