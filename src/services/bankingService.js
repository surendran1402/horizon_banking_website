import { v4 as uuidv4 } from 'uuid';

// Simulated banking API service
class BankingService {
  // Simulate bank account linking
  async linkBankAccount(userId, bankCredentials) {
    try {
      // Simulate API call to get public token
      const publicToken = `public_token_${Math.random().toString(36).substr(2, 15)}`;
      
      // Simulate converting public token to access token
      const accessToken = `access_token_${Math.random().toString(36).substr(2, 20)}`;
      
      // Simulate extracting bank account information
      const bankAccount = {
        id: uuidv4(),
        accountId: `ACC_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: bankCredentials.bankName || 'Primary Checking',
        type: 'checking',
        balance: Math.floor(Math.random() * 500000) + 10000,
        currency: 'INR',
        accountNumber: `****${Math.floor(Math.random() * 9000) + 1000}`,
        routingNumber: `****${Math.floor(Math.random() * 900000) + 100000}`,
        institution: bankCredentials.institution || 'Sample Bank',
        accessToken,
        createdAt: new Date().toISOString()
      };

      return {
        success: true,
        bankAccount,
        message: 'Bank account linked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulate creating verified funding source
  async createFundingSource(userId, accessToken, bankAccountId) {
    try {
      const fundingSource = {
        id: uuidv4(),
        userId,
        bankAccountId,
        accessToken,
        status: 'verified',
        createdAt: new Date().toISOString()
      };

      return {
        success: true,
        fundingSource,
        message: 'Funding source created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulate fund transfer
  async transferFunds(senderId, recipientPublicId, amount, description = '') {
    try {
      // Find recipient by public ID
      const recipient = await this.findUserByPublicId(recipientPublicId);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Create transaction record
      const transaction = {
        id: uuidv4(),
        senderId,
        recipientId: recipient.id,
        recipientPublicId,
        amount: parseFloat(amount),
        description,
        status: 'completed',
        type: 'transfer',
        createdAt: new Date().toISOString(),
        transactionId: `TXN_${Math.random().toString(36).substr(2, 12).toUpperCase()}`
      };

      // Update recipient's account balance and add transaction
      const existingUsers = JSON.parse(localStorage.getItem('horizon_users') || '[]');
      const updatedUsers = existingUsers.map(user => {
        if (user.id === recipient.id) {
          // Add money to recipient's account
          const updatedBankAccounts = user.bankAccounts?.map(account => ({
            ...account,
            balance: account.balance + parseFloat(amount)
          })) || [];

          // Add incoming transaction to recipient's history
          const incomingTransaction = {
            ...transaction,
            type: 'deposit',
            senderName: 'Payment Received'
          };

          return {
            ...user,
            bankAccounts: updatedBankAccounts,
            transactions: [...(user.transactions || []), incomingTransaction]
          };
        }
        return user;
      });

      // Save updated users to localStorage
      localStorage.setItem('horizon_users', JSON.stringify(updatedUsers));

      return {
        success: true,
        transaction,
        message: 'Transfer completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Find user by public ID
  async findUserByPublicId(publicId) {
    try {
      // Get all users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('horizon_users') || '[]');
      
      // Find user by public URL (which contains the public ID)
      const recipient = existingUsers.find(user => 
        user.publicUrl && user.publicUrl.includes(publicId)
      );

      if (recipient) {
        return recipient;
      }

      // If not found by public URL, try to find by customer ID
      const recipientByCustomerId = existingUsers.find(user => 
        user.customerId === publicId
      );

      return recipientByCustomerId || null;
    } catch (error) {
      console.error('Error finding user by public ID:', error);
      return null;
    }
  }

  // Get transaction history
  async getTransactionHistory(userId) {
    try {
      // Simulate fetching transaction history
      const transactions = [
        {
          id: uuidv4(),
          type: 'transfer',
          amount: 1500.00,
          description: 'Payment for services',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          recipientName: 'Jane Smith'
        },
        {
          id: uuidv4(),
          type: 'deposit',
          amount: 5000.00,
          description: 'Salary deposit',
          status: 'completed',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          senderName: 'Employer Corp'
        }
      ];

      return {
        success: true,
        transactions
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get account balance
  async getAccountBalance(accountId) {
    try {
      // Simulate fetching account balance
      const balance = Math.floor(Math.random() * 500000) + 10000;
      
      return {
        success: true,
        balance
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new BankingService(); 