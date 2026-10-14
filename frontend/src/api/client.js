const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (token && !endpoint.includes('/auth/login')) {
        clearAuthSession();
        window.location.href = '/';
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      errorObj.validationErrors = data?.validationErrors || null;
      throw errorObj;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('Unable to connect to backend server. Please verify backend is running on port 8080.');
    }
    throw err;
  }
}

// API Service Functions
export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  // Accounts
  getAccounts: () => request('/accounts'),
  getAccount: (id) => request(`/accounts/${id}`),
  createAccount: (accountData) =>
    request('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    }),
  lookupRecipient: (accountNumber) =>
    request(`/accounts/lookup?accountNumber=${encodeURIComponent(accountNumber)}`),

  // Transactions
  transfer: (transferData) =>
    request('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(transferData),
    }),

  deposit: (depositData) =>
    request('/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify(depositData),
    }),

  withdraw: (withdrawData) =>
    request('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawData),
    }),

  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'ALL') query.append('type', params.type);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    return request(`/transactions?${query.toString()}`);
  },

  getAccountTransactions: (accountId, params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'ALL') query.append('type', params.type);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    return request(`/transactions/account/${accountId}?${query.toString()}`);
  },

  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),
};
