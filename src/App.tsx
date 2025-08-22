import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, Search, Wallet, ExternalLink, Info, CheckCircle, AlertCircle, RefreshCw, Copy, Network, Zap, Shield } from 'lucide-react';


const AxelarCrosschainPayment = () => {
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [selectedFromChain, setSelectedFromChain] = useState<any>(null);
  const [selectedToChain, setSelectedToChain] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showChainModal, setShowChainModal] = useState(false);
  const [chainModalType, setChainModalType] = useState('from');

  // Axelar Gateway Tokens with images and details
  const gatewayTokens = [
    {
      symbol: 'axlUSDC',
      name: 'Axelar USDC',
      image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      description: 'Cross-chain USDC backed 1:1 by native USDC',
      chains: ['ethereum', 'polygon', 'avalanche', 'fantom', 'moonbeam', 'kujira', 'osmosis', 'juno'],
      decimals: 6,
      category: 'Stablecoin'
    },
    {
      symbol: 'axlUSDT',
      name: 'Axelar USDT',
      image: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      description: 'Cross-chain USDT for seamless transfers',
      chains: ['ethereum', 'polygon', 'avalanche', 'fantom', 'moonbeam'],
      decimals: 6,
      category: 'Stablecoin'
    },
    {
      symbol: 'axlWETH',
      name: 'Axelar Wrapped ETH',
      image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      description: 'Cross-chain wrapped Ethereum',
      chains: ['polygon', 'avalanche', 'fantom', 'moonbeam', 'osmosis'],
      decimals: 18,
      category: 'Cryptocurrency'
    },
    {
      symbol: 'axlWBTC',
      name: 'Axelar Wrapped BTC',
      image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      description: 'Cross-chain wrapped Bitcoin',
      chains: ['ethereum', 'polygon', 'avalanche', 'fantom'],
      decimals: 8,
      category: 'Cryptocurrency'
    },
    {
      symbol: 'axlDAI',
      name: 'Axelar DAI',
      image: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
      description: 'Cross-chain DAI stablecoin',
      chains: ['ethereum', 'polygon', 'avalanche', 'fantom'],
      decimals: 18,
      category: 'Stablecoin'
    },
    {
      symbol: 'axlFRAX',
      name: 'Axelar FRAX',
      image: 'https://assets.coingecko.com/coins/images/13422/large/frax_logo.png',
      description: 'Cross-chain FRAX stablecoin',
      chains: ['ethereum', 'polygon', 'avalanche', 'moonbeam'],
      decimals: 18,
      category: 'Stablecoin'
    },
    {
      symbol: 'AXL',
      name: 'Axelar Token',
      image: 'https://assets.coingecko.com/coins/images/27277/large/V-65_xQ1_400x400.jpeg',
      description: 'Native Axelar network token',
      chains: ['axelar', 'osmosis', 'kujira', 'juno', 'ethereum'],
      decimals: 6,
      category: 'Governance'
    }
  ];

  // Supported chains with their details
  const supportedChains = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      color: 'from-blue-500 to-blue-600',
      networkId: '1'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      image: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      color: 'from-purple-500 to-purple-600',
      networkId: '137'
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      image: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
      color: 'from-red-500 to-red-600',
      networkId: '43114'
    },
    {
      id: 'fantom',
      name: 'Fantom',
      image: 'https://cryptologos.cc/logos/fantom-ftm-logo.png',
      color: 'from-blue-400 to-blue-500',
      networkId: '250'
    },
    {
      id: 'moonbeam',
      name: 'Moonbeam',
      image: 'https://assets.coingecko.com/coins/images/22459/large/glmr.png',
      color: 'from-teal-500 to-teal-600',
      networkId: '1284'
    },
    {
      id: 'osmosis',
      name: 'Osmosis',
      image: 'https://assets.coingecko.com/coins/images/16724/large/osmo.png',
      color: 'from-pink-500 to-purple-500',
      networkId: 'osmosis-1'
    },
    {
      id: 'kujira',
      name: 'Kujira',
      image: 'https://assets.coingecko.com/coins/images/24581/large/kujira-200.png',
      color: 'from-orange-500 to-red-500',
      networkId: 'kaiyo-1'
    },
    {
      id: 'juno',
      name: 'Juno',
      image: 'https://assets.coingecko.com/coins/images/19249/large/juno.png',
      color: 'from-orange-400 to-orange-500',
      networkId: 'juno-1'
    }
  ];

  const filteredTokens = gatewayTokens.filter(token =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTokenSelect = (token: any) => {
    setSelectedToken(token);
    setShowTokenModal(false);
    // Reset chains if token doesn't support current selection
    if (selectedFromChain && !token.chains.includes(selectedFromChain.id)) {
      setSelectedFromChain(null);
    }
    if (selectedToChain && !token.chains.includes(selectedToChain.id)) {
      setSelectedToChain(null);
    }
  };

  const handleChainSelect = (chain: any) => {
    if (chainModalType === 'from') {
      setSelectedFromChain(chain);
    } else {
      setSelectedToChain(chain);
    }
    setShowChainModal(false);
  };

  const openChainModal = (type: any) => {
    setChainModalType(type);
    setShowChainModal(true);
  };

  const getAvailableChains = () => {
    if (!selectedToken) return [];
    return supportedChains.filter(chain => selectedToken.chains.includes(chain.id));
  };

  const handleSwapChains = () => {
    const temp = selectedFromChain;
    setSelectedFromChain(selectedToChain);
    setSelectedToChain(temp);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
  };

  const isFormValid = selectedToken && selectedFromChain && selectedToChain && amount && recipient;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%236366f1\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div> */}
      
      {/* Header */}
      <header className="relative z-10 border-b border-purple-800/50 bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Axelar Bridge</h1>
                <p className="text-xs text-gray-400">Crosschain Payments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://docs.axelar.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                Docs
                <ExternalLink size={16} />
              </a>
              <div className="w-px h-6 bg-gray-700"></div>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Payment Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Send Tokens Cross-Chain</h2>
            <p className="text-gray-400 text-lg">
              Transfer any Axelar gateway token between supported blockchains
            </p>
          </div>

          {/* Token Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Select Token
            </label>
            <button
              onClick={() => setShowTokenModal(true)}
              className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-xl text-left hover:border-purple-500 transition-all duration-200 flex items-center justify-between"
            >
              {selectedToken ? (
                <div className="flex items-center gap-3">
                  <img src={selectedToken.image} alt={selectedToken.symbol} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="text-white font-semibold">{selectedToken.symbol}</div>
                    <div className="text-gray-400 text-sm">{selectedToken.name}</div>
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">Choose a token to send</span>
              )}
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Chain Selection */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                From Chain
              </label>
              <button
                onClick={() => openChainModal('from')}
                disabled={!selectedToken}
                className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-xl text-left hover:border-purple-500 transition-all duration-200 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedFromChain ? (
                  <div className="flex items-center gap-3">
                    <img src={selectedFromChain.image} alt={selectedFromChain.name} className="w-6 h-6 rounded-full" />
                    <span className="text-white font-medium">{selectedFromChain.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Select source chain</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                To Chain
              </label>
              <button
                onClick={() => openChainModal('to')}
                disabled={!selectedToken}
                className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-xl text-left hover:border-purple-500 transition-all duration-200 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedToChain ? (
                  <div className="flex items-center gap-3">
                    <img src={selectedToChain.image} alt={selectedToChain.name} className="w-6 h-6 rounded-full" />
                    <span className="text-white font-medium">{selectedToChain.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Select destination chain</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Swap Chains Button */}
          {selectedFromChain && selectedToChain && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleSwapChains}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                title="Swap chains"
              >
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-xl"
            />
          </div>

          {/* Recipient Address */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x... or cosmos1..."
              className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handlePayment}
            disabled={!isFormValid || isProcessing}
            className={`w-full py-4 px-6 cursor-pointer rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 ${
              !isFormValid || isProcessing
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-[1.02] shadow-lg hover:shadow-purple-500/40'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Send {selectedToken ? selectedToken.symbol : 'Tokens'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Transaction Info */}
          {selectedFromChain && selectedToChain && (
            <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">Transaction Details</span>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>Route: {selectedFromChain.name} → Axelar → {selectedToChain.name}</div>
                <div>Estimated time: 2-5 minutes</div>
                <div>Network fees: ~$2-5 USD</div>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 text-center">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Secure</h3>
            <p className="text-sm text-gray-400">Powered by Axelar's battle-tested interchain infrastructure</p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 text-center">
            <Network className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Universal</h3>
            <p className="text-sm text-gray-400">Connect any blockchain with any blockchain</p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Fast</h3>
            <p className="text-sm text-gray-400">Typically complete within 2-5 minutes</p>
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Select Token</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tokens..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => handleTokenSelect(token)}
                  className="w-full p-4 hover:bg-gray-700/30 transition-colors text-left border-b border-gray-700/30 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <img src={token.image} alt={token.symbol} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <div className="text-white font-semibold">{token.symbol}</div>
                      <div className="text-gray-400 text-sm">{token.name}</div>
                      <div className="text-gray-500 text-xs">{token.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-purple-400">{token.category}</div>
                      <div className="text-xs text-gray-500">{token.chains.length} chains</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700/50">
              <button
                onClick={() => setShowTokenModal(false)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chain Selection Modal */}
      {showChainModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 w-full max-w-md">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-semibold text-white">
                Select {chainModalType === 'from' ? 'Source' : 'Destination'} Chain
              </h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {getAvailableChains().map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => handleChainSelect(chain)}
                  disabled={
                    (chainModalType === 'from' && selectedToChain?.id === chain.id) ||
                    (chainModalType === 'to' && selectedFromChain?.id === chain.id)
                  }
                  className="w-full p-4 hover:bg-gray-700/30 transition-colors text-left rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <img src={chain.image} alt={chain.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-white font-medium">{chain.name}</div>
                      <div className="text-gray-400 text-sm">Network ID: {chain.networkId}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700/50">
              <button
                onClick={() => setShowChainModal(false)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AxelarCrosschainPayment;