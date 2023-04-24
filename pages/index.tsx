import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { before } from 'node:test';

interface Network {
  name: string;
  rpcUrl: string;
  chainId: number;
}

interface NetworkBalance {
  networkName: string;
  balance: string;
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
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBalance',
      params: [address, 'latest'],
    };
    try {
      const response = await axios.post(network.rpcUrl, payload);
      const balance = ethers.formatEther(response.data.result)
      console.log("Balance: ", balance)
      const networkBalance = { networkName: network.name, balance };
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
      // networks.forEach(fetchBalance);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Networks Page</h1>
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
                </tr>
              </thead>
              <tbody>
                {balanceData.map((balance) => (
                  <tr key={balance.networkName}>
                    <td className="border px-4 py-2">{balance.networkName}</td>
                    <td className="border px-4 py-2">{balance.balance}</td>
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
