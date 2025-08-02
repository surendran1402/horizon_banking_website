import React, { useState } from 'react';
import { X, CreditCard, Building, Lock } from 'lucide-react';

const LinkBankAccount = ({ onLink, onClose }) => {
  const [formData, setFormData] = useState({
    institution: '',
    accountType: 'checking',
    accountNumber: '',
    routingNumber: '',
    accountName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      await onLink(formData);
    } catch (error) {
      setError('Failed to link account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Link Bank Account</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="institution" className="form-label">
                Financial Institution
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  required
                  className="input-field pl-10"
                  placeholder="e.g., Chase Bank, Wells Fargo"
                  value={formData.institution}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="accountType" className="form-label">
                Account Type
              </label>
              <select
                id="accountType"
                name="accountType"
                className="input-field"
                value={formData.accountType}
                onChange={handleChange}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label htmlFor="accountName" className="form-label">
                Account Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  required
                  className="input-field pl-10"
                  placeholder="e.g., Primary Checking"
                  value={formData.accountName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="accountNumber" className="form-label">
                Account Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  required
                  className="input-field pl-10"
                  placeholder="Enter account number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="routingNumber" className="form-label">
                Routing Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="routingNumber"
                  name="routingNumber"
                  required
                  className="input-field pl-10"
                  placeholder="Enter routing number"
                  value={formData.routingNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
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
                disabled={loading}
                className="btn-primary flex-1 flex justify-center items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Link Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Security Notice</h4>
            <p className="text-xs text-blue-700">
              Your banking credentials are encrypted and securely transmitted. 
              We use industry-standard security protocols to protect your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkBankAccount; 