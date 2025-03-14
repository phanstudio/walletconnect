const connectButton = document.getElementById('connectWallet');
const walletAddressDiv = document.getElementById('walletAddress');
const walletBalanceDiv = document.getElementById('walletBalance');

connectButton.addEventListener('click', async () => {
  const ethers = window.ethers;

  try {
    // Init WalletConnect Provider
    const wcProvider = new window.WalletConnectProvider.default({
        projectId: '5379c9e3bf58798f600c7cd162a5120f',
        chains: [1], // Ethereum Mainnet
        rpc:'https://mainnet.infura.io/v3/YOUR_INFURA_ID',
        showQrModal: true,
        methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
    });
      
    await wcProvider.enable(); // ✅ still valid and will open WalletConnect QR modal
    
    // Create Ethers provider + signer
    const ethersProvider = new ethers.BrowserProvider(wcProvider);
    const signer = await ethersProvider.getSigner();

    // Get address
    const address = await signer.getAddress();
    console.log("Connected Address:", address);
    walletAddressDiv.textContent = `Address: ${address}`;

    // Get ETH balance
    const balance = await ethersProvider.getBalance(address);
    console.log("Balance (wei):", balance.toString());
    walletBalanceDiv.textContent = `ETH Balance: ${ethers.formatEther(balance)} ETH`;

    // OPTIONAL: Listen for account changes
    wcProvider.on('accountsChanged', (accounts) => {
      console.log('Accounts changed:', accounts);
      walletAddressDiv.textContent = `Address: ${accounts[0]}`;
    });

    // OPTIONAL: Listen for network changes
    wcProvider.on('chainChanged', (chainId) => {
      console.log('Chain changed to:', chainId);
    });

  } catch (error) {
    console.error('Wallet connection failed:', error);
    alert('Failed to connect wallet. See console for details.');
  }
});
