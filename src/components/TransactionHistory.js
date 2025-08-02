import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import bankingService from '../services/bankingService';

const TransactionHistory = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // First try to get transactions from user state (recent transfers)
        if (user.transactions && user.transactions.length > 0) {
          setTransactions(user.transactions);
          setLoading(false);
          return;
        }

        // Fallback to API call for historical transactions
        const result = await bankingService.getTransactionHistory(user.id);
        if (result.success) {
          setTransactions(result.transactions);
        } else {
          setError('Failed to load transaction history');
        }
      } catch (error) {
        setError('An error occurred while loading transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user.id, user.transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'deposit':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'transfer':
        return 'Sent';
      case 'deposit':
        return 'Received';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading transactions</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
        <div className="text-sm text-gray-500">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your transaction history will appear here once you make your first transfer.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {getTransactionTypeLabel(transaction.type)}
                      </p>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {transaction.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'transfer' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'transfer' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.transactionId}
                    </p>
                  </div>
                </div>
              </div>
              
              {transaction.recipientName && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {transaction.type === 'transfer' ? 'To: ' : 'From: '}
                    <span className="font-medium text-gray-700">
                      {transaction.recipientName}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Transaction Details</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• All transactions are processed instantly</p>
          <p>• Transfer fees may apply depending on your account type</p>
          <p>• Transaction IDs are provided for reference</p>
          <p>• Contact support if you notice any discrepancies</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory; 