import React, { useState } from 'react';
import { X, Send, User, DollarSign, MessageSquare, IndianRupee } from 'lucide-react';

const TransferFunds = ({ onTransfer, user, onClose }) => {
  const [formData, setFormData] = useState({
    recipientPublicId: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await onTransfer(formData);
      setSuccess('Transfer completed successfully!');
      // Reset form
      setFormData({
        recipientPublicId: '',
        amount: '',
        description: ''
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError('Failed to process transfer. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Send Money</h3>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Available Balance</span>
            <span className="text-lg font-bold text-blue-900">
              {formatCurrency(getTotalBalance())}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recipientPublicId" className="form-label">
              Recipient's Public Bank ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="recipientPublicId"
                name="recipientPublicId"
                required
                className="input-field pl-10"
                placeholder="Enter recipient's public bank ID"
                value={formData.recipientPublicId}
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is the unique identifier shared by the recipient
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="form-label">
              Amount
            </label>
                          <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-gray-400" />
                </div>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="0.01"
                step="0.01"
                className="input-field pl-10"
                                  placeholder="0.00 (₹)"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="description"
                name="description"
                className="input-field pl-10"
                placeholder="What's this payment for?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.recipientPublicId || !formData.amount}
              className="btn-primary flex-1 flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Money
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h4 className="text-sm font-medium text-gray-900 mb-2">How it works</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Enter the recipient's public bank ID (shared by them)</p>
          <p>2. Specify the amount you want to send</p>
          <p>3. Add an optional description for the payment</p>
          <p>4. Confirm the transfer - funds will be sent instantly</p>
        </div>
      </div>
    </div>
  );
};

export default TransferFunds; 