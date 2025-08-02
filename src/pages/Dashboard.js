import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import bankingService from '../services/bankingService';
import { 
  CreditCard, 
  Send, 
  History, 
  Plus, 
  DollarSign, 
  Shield,
  Copy,
  Check,
  CheckCircle,
  X,
  RefreshCw,
  IndianRupee,
  Eye,
  EyeOff
} from 'lucide-react';
import LinkBankAccount from '../components/LinkBankAccount';
import TransferFunds from '../components/TransferFunds';
import TransactionHistory from '../components/TransactionHistory';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkAccount, setShowLinkAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [incomingPayment, setIncomingPayment] = useState(false);
  const [lastTransactionCount, setLastTransactionCount] = useState(0);
  const [revealedCards, setRevealedCards] = useState({});

  // Refresh user data from localStorage to get latest updates
  useEffect(() => {
    if (user) {
      const checkForUpdates = () => {
        const existingUsers = JSON.parse(localStorage.getItem('horizon_users') || '[]');
        const updatedUser = existingUsers.find(u => u.id === user.id);
        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(user)) {
          // Check if there are new incoming transactions
          const currentTransactionCount = user.transactions?.length || 0;
          const newTransactionCount = updatedUser.transactions?.length || 0;
          
          if (newTransactionCount > currentTransactionCount) {
            // Check if the new transaction is an incoming payment
            const newTransactions = updatedUser.transactions.slice(currentTransactionCount);
            const hasIncomingPayment = newTransactions.some(t => t.type === 'deposit');
            
            if (hasIncomingPayment) {
              setIncomingPayment(true);
              setTimeout(() => setIncomingPayment(false), 5000);
            }
          }
          
          updateUser(updatedUser);
        }
      };

      // Check immediately
      checkForUpdates();

      // Set up polling to check for updates every 2 seconds
      const interval = setInterval(checkForUpdates, 2000);

      return () => clearInterval(interval);
    }
  }, [user, updateUser]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshUserData = () => {
    if (user) {
      const existingUsers = JSON.parse(localStorage.getItem('horizon_users') || '[]');
      const updatedUser = existingUsers.find(u => u.id === user.id);
      if (updatedUser) {
        updateUser(updatedUser);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTotalBalance = () => {
    if (!user.bankAccounts || user.bankAccounts.length === 0) return 0;
    return user.bankAccounts.reduce((total, account) => total + account.balance, 0);
  };

  const toggleCardNumber = (accountId) => {
    console.log('Button clicked for account:', accountId);
    setRevealedCards(prev => {
      const newState = {
        ...prev,
        [accountId]: !prev[accountId]
      };
      console.log('Previous state:', prev);
      console.log('New state:', newState);
      return newState;
    });
  };

  const formatCardNumber = (accountNumber, isRevealed) => {
    if (isRevealed) {
      // Show a realistic 16-digit card number with last 4 digits matching the account
      const lastFour = accountNumber.toString().slice(-4);
      const cardNumber = `4532 8765 4321 ${lastFour}`;
      return cardNumber;
    }
    return `XXXX XXXX XXXX ${accountNumber.toString().slice(-4)}`;
  };

  const handleLinkAccount = async (bankCredentials) => {
    try {
      const result = await bankingService.linkBankAccount(user.id, bankCredentials);
      if (result.success) {
        const updatedUser = {
          ...user,
          bankAccounts: [...(user.bankAccounts || []), result.bankAccount]
        };
        updateUser(updatedUser);
        setShowLinkAccount(false);
      }
    } catch (error) {
      console.error('Error linking account:', error);
    }
  };

  const handleTransfer = async (transferData) => {
    try {
      const result = await bankingService.transferFunds(
        user.id,
        transferData.recipientPublicId,
        transferData.amount,
        transferData.description
      );
      
      if (result.success) {
        // Update bank account balances by deducting the transfer amount
        const updatedBankAccounts = user.bankAccounts?.map(account => ({
          ...account,
          balance: Math.max(0, account.balance - parseFloat(transferData.amount))
        })) || [];

        const updatedUser = {
          ...user,
          bankAccounts: updatedBankAccounts,
          transactions: [...(user.transactions || []), result.transaction]
        };
        updateUser(updatedUser);
        setShowTransfer(false);
        setTransferSuccess(true);
        setTimeout(() => setTransferSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error processing transfer:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-lg font-bold">H</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-white">
                Horizon Banking
              </h1>
            </div>
                         <div className="flex items-center space-x-6">
               <button
                 onClick={refreshUserData}
                 className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
                 title="Refresh for incoming payments"
               >
                 <RefreshCw className="w-4 h-4" />
                 <span className="hidden sm:inline">Refresh</span>
               </button>
               <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg px-4 py-2 backdrop-blur-sm">
                 <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                   <span className="text-white text-sm font-medium">
                     {user.name.charAt(0).toUpperCase()}
                   </span>
                 </div>
                 <div className="text-white">
                   <p className="text-sm font-medium">Welcome back</p>
                   <p className="text-xs opacity-90">{user.name}</p>
                 </div>
               </div>
               <button
                 onClick={() => updateUser(null)}
                 className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
                 <span>Logout</span>
               </button>
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Notification */}
        {transferSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Transfer completed successfully! Your balance has been updated.</span>
            </div>
            <button
              onClick={() => setTransferSuccess(false)}
              className="text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Incoming Payment Notification */}
        {incomingPayment && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>🎉 You received money! Your balance has been updated.</span>
            </div>
            <button
              onClick={() => setIncomingPayment(false)}
              className="text-blue-500 hover:text-blue-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: IndianRupee },
              { id: 'accounts', label: 'Accounts', icon: CreditCard },
              { id: 'transfer', label: 'Transfer', icon: Send },
              { id: 'history', label: 'History', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <IndianRupee className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Balance (₹)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(getTotalBalance())}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Connected Accounts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user.bankAccounts?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Customer ID</p>
                    <p className="text-sm font-mono text-gray-900">{user.customerId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowLinkAccount(true)}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-600">Link Bank Account</span>
                </button>
                
                <button
                  onClick={() => setShowTransfer(true)}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Send className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-600">Send Money</span>
                </button>
              </div>
            </div>

            {/* Public URL */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Public URL</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={user.publicUrl}
                  readOnly
                  className="input-field flex-1"
                />
                <button
                  onClick={() => copyToClipboard(user.publicUrl)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Share this URL with others to receive payments
              </p>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Bank Accounts</h2>
              <button
                onClick={() => setShowLinkAccount(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Link Account</span>
              </button>
            </div>

            {user.bankAccounts && user.bankAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.bankAccounts.map((account, index) => (
                  <div key={account.id} className="relative group">
                    {/* Debit Card Design */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white p-8 h-56 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-600">
                      {/* Card Chip */}
                      <div className="absolute top-6 left-6">
                        <div className="w-14 h-11 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                          <div className="w-10 h-7 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-md flex items-center justify-center">
                            <div className="w-7 h-5 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-sm flex items-center justify-center">
                              <div className="w-5 h-3 bg-yellow-700 rounded-sm"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank Logo */}
                      <div className="absolute top-6 right-6">
                        <div className="w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Card Number with Eye Icon */}
                      <div className="absolute bottom-28 left-6 right-6">
                        <div className="flex items-center">
                          <div className="text-xl font-mono tracking-widest font-light">
                            {formatCardNumber(account.accountNumber, revealedCards[account.id])}
                          </div>
                          <button
                            onClick={() => toggleCardNumber(account.id)}
                            className="ml-2 p-1.5 bg-white bg-opacity-25 rounded-full backdrop-blur-sm hover:bg-opacity-35 transition-all duration-200 cursor-pointer z-10 relative"
                            type="button"
                          >
                            {revealedCards[account.id] ? (
                              <Eye className="h-3 w-3 text-white" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-white" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Holder Name */}
                      <div className="absolute bottom-20 left-6">
                        <div className="text-sm font-semibold tracking-wide">{user.name.toUpperCase()}</div>
                      </div>

                      {/* Bank Name */}
                      <div className="absolute bottom-20 right-6 text-right">
                        <div className="text-xs text-gray-300 font-medium">{account.institution}</div>
                        <div className="text-xs font-semibold tracking-wide">DEBIT</div>
                      </div>

                      {/* Balance Display */}
                      <div className="absolute bottom-8 left-6 right-28">
                        <div className="text-xs text-gray-300 font-medium tracking-wide">AVAILABLE BALANCE</div>
                        <div className="text-lg font-bold text-emerald-400">
                          {formatCurrency(account.balance)}
                        </div>
                      </div>

                      {/* Card Network Logo */}
                      <div className="absolute bottom-6 right-6">
                        <div className="w-10 h-7 bg-white rounded-md flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-slate-800 tracking-wide">VISA</span>
                        </div>
                      </div>

                      {/* Subtle Pattern Overlay */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-transparent to-transparent"></div>
                      </div>
                    </div>


                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by linking your first bank account.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowLinkAccount(true)}
                    className="btn-primary"
                  >
                    Link Account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transfer' && (
          <TransferFunds
            onTransfer={handleTransfer}
            user={user}
            onClose={() => setShowTransfer(false)}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistory user={user} />
        )}
      </div>

      {/* Modals */}
      {showLinkAccount && (
        <LinkBankAccount
          onLink={handleLinkAccount}
          onClose={() => setShowLinkAccount(false)}
        />
      )}

      {showTransfer && (
        <TransferFunds
          onTransfer={handleTransfer}
          user={user}
          onClose={() => setShowTransfer(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 