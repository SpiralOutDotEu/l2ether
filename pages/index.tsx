import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { before } from 'node:test';

interface Links {
  description: string;
  link: string;
}
interface Network {
  name: string;
  rpcUrl: string;
  chainId: number;
  links: string;
  comments: string;
}

interface NetworkBalance {
  networkName: string;
  balance: string;
  txCount: string;
  links: any;
  comments: string;

}

const NetworksPage = () => {
  const [address, setAddress] = useState('');
  const [balanceData, setBalanceData] = useState<NetworkBalance[]>([]);
  const networks = require('../public/networks.json').networks

  useEffect(() => {
    networks.forEach(fetchBalance);
  }, [address]);

  const getAddress = (address: string) => {
    if (ethers.isAddress(address)) {
      return address;
    } else {
      throw new Error('Invalid Ethereum address');
    }
  };

  const fetchBalance = async (network: Network) => {
    console.log("Fetch for Address: ", address)
    const balancePayload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBalance',
      params: [address, 'latest'],
    };
    const txCountPayload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionCount',
      params: [address, 'latest'],
    };
    try {
      const response = await axios.post(network.rpcUrl, balancePayload);
      const balance = ethers.formatEther(response.data.result)
      const txCountResponse = await axios.post(network.rpcUrl, txCountPayload);
      const txCount = ethers.formatUnits(txCountResponse.data.result, "wei");
      const links = network.links
      const comments = network.comments

      console.log("Links: ", typeof (links))
      console.log("TX Count: ", txCount)
      const networkBalance = { networkName: network.name, balance, txCount, links , comments};
      setBalanceData((prevState) => [...prevState, networkBalance]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      await setAddress(address);
      console.log("Address: ", address)
      setBalanceData([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">L2Ether Central Station</h1>
      {!address ? (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleConnectWallet}
        >
          Connect MetaMask Wallet
        </button>
      ) : (
        <>
          <p className="text-xl font-bold mb-4">Address: {address}</p>
          {balanceData.length === 0 ? (
            <p>Loading...</p>
          ) : (
            <table className="table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Network</th>
                  <th className="px-4 py-2">Balance</th>
                  <th className="px-4 py-2">tx Count</th>
                  <th className="px-4 py-2">Links</th>
                  <th className="px-4 py-2">To Do</th>
                </tr>
              </thead>
              <tbody>
                {balanceData.map((balance) => (
                  <tr key={balance.networkName}>
                    <td className="border px-4 py-2">{balance.networkName}</td>
                    <td className="border px-4 py-2">{balance.balance}</td>
                    <td className="border px-4 py-2">{balance.txCount}</td>
                    <td className="border px-4 py-2">{
                      balance.links &&
                      Object.entries(balance.links).map((key: any, value: any) => (
                        <a className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'
                          target="_blank" rel="noopener noreferrer"
                          href={key[1]} key={key[0]}> ○ {key[0]} 
                        </a>
                      ))

                    }</td>
                    <td className="border px-4 py-2">{
                    balance.comments &&
                    <span>{balance.comments}</span>
                    }</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default NetworksPage;
