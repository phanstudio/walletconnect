// import {
//     EthereumClient,
//     w3mConnectors,
//     w3mProvider,
//     WagmiCore,
//     WagmiCoreChains,
//   } from "https://unpkg.com/@web3modal/ethereum@2.7.0";
  
//   import { Web3Modal } from "https://unpkg.com/@web3modal/html@2.6.2";
  
//   // Import wagmi dependencies
//   const { mainnet, polygon, avalanche, arbitrum } = WagmiCoreChains;
//   const { configureChains, createConfig, watchAccount, disconnect } = WagmiCore;
  
//   // You must replace this with a valid WalletConnect v2 project ID
//   // Get one at https://cloud.walletconnect.com/
//   const projectId = "5379c9e3bf58798f600c7cd162a5120f";
//   const chains = [mainnet, polygon, avalanche, arbitrum];
  
//   try {
//     // Configure wagmi client
//     const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
//     const wagmiConfig = createConfig({
//       autoConnect: false, // Changed to false to prevent automatic connection attempts
//       connectors: w3mConnectors({ projectId, chains }),
//       publicClient
//     });
  
//     // Create Ethereum and modal clients
//     const ethereumClient = new EthereumClient(wagmiConfig, chains);
//     const web3Modal = new Web3Modal(
//       {
//         projectId,
//         themeMode: "light",
//         themeColor: "default",
//         explorerRecommendedWalletIds: undefined, // Remove this restriction
//         explorerExcludedWalletIds: undefined, // Remove exclusions
//         mobileWallets: undefined, // Let the modal decide
//         desktopWallets: undefined, // Let the modal decide
//         walletImages: undefined, // Use defaults
//         enableNetworkView: true,
//         enableAccountView: true,
//         enableExplorer: true
//       },
//       ethereumClient
//     );
  
//     // Implement account watching with proper error handling
//     let currentAccount = null;
  
//     function checkAccount(account) {
//       try {
//         currentAccount = account;
//         console.log("Account changed:", account);
        
//         const accountDisplay = document.getElementById('accountDisplay');
//         if (accountDisplay) {
//           if (account.isConnected) {
//             accountDisplay.textContent = `Connected: ${account.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Unknown'}`;
//           } else {
//             accountDisplay.textContent = 'Not connected';
//           }
//         }
//       } catch (error) {
//         console.error("Error processing account update:", error);
//       }
//     }
  
//     // Set up account watcher
//     const unwatch = watchAccount((account) => checkAccount(account));
  
//     // Set up event listeners once the DOM is loaded
//     document.addEventListener('DOMContentLoaded', () => {
//       const connectBtn = document.getElementById('connectBtn');
      
//       if (connectBtn) {
//         connectBtn.addEventListener('click', () => {
//           try {
//             web3Modal.openModal();
//           } catch (error) {
//             console.error("Error opening modal:", error);
//             alert("Failed to open wallet connection modal. Please try again.");
//           }
//         });
//       }
      
//       // Add disconnect button functionality
//       const disconnectBtn = document.getElementById('disconnectBtn');
//       if (disconnectBtn) {
//         disconnectBtn.addEventListener('click', async () => {
//           try {
//             await disconnect();
//             console.log("Wallet disconnected");
            
//             const accountDisplay = document.getElementById('accountDisplay');
//             if (accountDisplay) {
//               accountDisplay.textContent = 'Not connected';
//             }
//           } catch (error) {
//             console.error("Error disconnecting wallet:", error);
//           }
//         });
//       }
//     });
  
//     // Clean up function to prevent memory leaks
//     window.addEventListener('beforeunload', () => {
//       if (unwatch && typeof unwatch === 'function') {
//         unwatch();
//       }
//     });
  
//     // Export the web3Modal instance for use in other modules if needed
//     window.web3Modal = web3Modal;
    
//   } catch (error) {
//     console.error("Failed to initialize Web3Modal:", error);
//     alert("Web3Modal initialization failed. Please check your project ID and network connection.");
//   }
// Main wallet connection handler
async function connectToWallet() {
    const environment = detectEnvironment();
    
    if (environment.isMobile) {
      // Use deep linking for mobile
      handleMobileConnection(environment.mobileOS);
    } else {
      // Use browser extension for desktop
      await connectWithBrowserExtension();
    }
  }
  
  // Environment detection
  function detectEnvironment() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check if mobile
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
    
    // Detect mobile OS
    let mobileOS = null;
    if (isMobile) {
      if (/android/i.test(userAgent)) {
        mobileOS = 'android';
      } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        mobileOS = 'ios';
      }
    }
    
    // Check for installed browser extensions
    const hasMetaMaskExtension = typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    const hasCoinbaseExtension = typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet;
    alert(mobileOS)
    return {
      isMobile,
      mobileOS,
      hasMetaMaskExtension,
      hasCoinbaseExtension,
      hasAnyWalletExtension: hasMetaMaskExtension || hasCoinbaseExtension
    };
  }
  
  // Handle mobile connection with deep links
  function handleMobileConnection(mobileOS) {
    // Create connection options UI
    const walletOptions = [
      { name: 'MetaMask', id: 'metamask', logo: 'metamask-logo.png' },
      { name: 'Trust Wallet', id: 'trust', logo: 'trust-logo.png' },
      { name: 'Coinbase Wallet', id: 'coinbase', logo: 'coinbase-logo.png' },
      { name: 'Rainbow', id: 'rainbow', logo: 'rainbow-logo.png' }
    ];
    
    // Show wallet selection modal
    showWalletSelectionModal(walletOptions, (selectedWallet) => {
      openWalletDeepLink(selectedWallet, mobileOS);
    });
  }
  
  // Open deep link to wallet
  function openWalletDeepLink(walletId, mobileOS) {
    // Encode current URL to be passed to the wallet
    const currentUrl = encodeURIComponent(window.location.href);
    
    // Base deep link configuration
    const deepLinks = {
      metamask: {
        ios: `metamask://dapp/${currentUrl}`,
        android: `metamask://dapp/${currentUrl}`, // problem
        universal: `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
      },
      trust: {
        ios: `trust://open_url?url=${currentUrl}`,
        android: `trust://open_url?url=${currentUrl}`,
        universal: `https://link.trustwallet.com/open_url?url=${currentUrl}`
      },
      coinbase: {
        ios: `coinbasewallet://dapp/${currentUrl}`,
        android: `coinbasewallet://dapp/${currentUrl}`,
        universal: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`
      },
      rainbow: {
        ios: `rainbow://dapp/${currentUrl}`,
        android: `rainbow://dapp/${currentUrl}`,
        universal: `https://rnbwapp.com/dapp?url=${currentUrl}`
      }
    };
    
    // Get the appropriate link based on OS
    const selectedWallet = deepLinks[walletId];
    
    if (selectedWallet) {
      // Try native URI scheme first
      const nativeLink = selectedWallet[mobileOS];
      const universalLink = selectedWallet.universal;
      
      // Initialize a timer for fallback to universal link
      const fallbackTimer = setTimeout(() => {
        // If app didn't open, try universal link
        window.location.href = universalLink;
      }, 1000);
      
      // Add event listener to clear the timer if the page is hidden (app opened)
      document.addEventListener('visibilitychange', function checkVisibility() {
        if (document.visibilityState === 'hidden') {
          clearTimeout(fallbackTimer);
          document.removeEventListener('visibilitychange', checkVisibility);
        }
      });
      
      // Try to open the native app
      window.location.href = nativeLink;
    } else {
      console.error('Wallet not supported');
    }
  }
  
  // Desktop browser extension connection
  async function connectWithBrowserExtension() {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = provider.getSigner();
        alert("Connected account:", accounts[0]);
        return { provider, signer, account: accounts[0] };
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      console.log("No Ethereum browser extension detected");
      // Suggest installing MetaMask
      showExtensionInstallPrompt();
    }
  }
  
  // Simple UI for wallet selection modal
  function showWalletSelectionModal(wallets, callback) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'wallet-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 999;';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'wallet-modal-content';
    modalContent.style.cssText = 'background: white; border-radius: 12px; padding: 20px; width: 85%; max-width: 400px;';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Connect Wallet';
    title.style.cssText = 'text-align: center; margin-bottom: 20px;';
    modalContent.appendChild(title);
    
    // Add wallet options
    wallets.forEach(wallet => {
      const option = document.createElement('div');
      option.className = 'wallet-option';
      option.style.cssText = 'display: flex; align-items: center; padding: 12px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px; cursor: pointer;';
      
      // Add logo placeholder (in a real app, you'd use actual logos)
      const logo = document.createElement('div');
      logo.style.cssText = 'width: 32px; height: 32px; background-color: #f0f0f0; border-radius: 50%; margin-right: 12px;';
      option.appendChild(logo);
      
      // Add wallet name
      const name = document.createElement('span');
      name.textContent = wallet.name;
      option.appendChild(name);
      
      // Add click handler
      option.addEventListener('click', () => {
        modal.remove();
        callback(wallet.id);
      });
      
      modalContent.appendChild(option);
    });
    
    // Add cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'display: block; width: 100%; padding: 12px; border: none; background: #f0f0f0; border-radius: 8px; margin-top: 10px; cursor: pointer;';
    cancelBtn.addEventListener('click', () => {
      modal.remove();
    });
    modalContent.appendChild(cancelBtn);
    
    // Add modal to page
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  
  // Show extension install prompt for desktop
  function showExtensionInstallPrompt() {
    const message = document.createElement('div');
    message.style.cssText = 'position: fixed; top: 20px; right: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 300px;';
    message.innerHTML = `
      <h4 style="margin-top: 0;">No wallet detected</h4>
      <p>Please install a Web3 wallet to continue:</p>
      <a href="https://metamask.io/download/" target="_blank" style="display: block; margin-bottom: 8px;">Install MetaMask</a>
      <a href="https://www.coinbase.com/wallet/downloads" target="_blank">Install Coinbase Wallet</a>
      <button style="position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer;">✕</button>
    `;
    
    // Add close button functionality
    const closeBtn = message.querySelector('button');
    closeBtn.addEventListener('click', () => {
      message.remove();
    });
    
    document.body.appendChild(message);
  }
  
  // Example usage - add this to your connect button
  document.getElementById('connect-wallet-btn').addEventListener('click', connectToWallet);