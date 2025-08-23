// Midtrans configuration
export const MIDTRANS_CONFIG = {
  clientKey: 'SB-Mid-client-pbCU77GhpobR9an-',
  serverKey: 'SB-Mid-server-DP1m6khrSJWV4yaH0Gv_U9_b',
  merchantId: 'G852074646',
  isProduction: false, // Set to true for production
  apiUrl: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
  webhookUrl: 'https://vzgnjljgkmgibleexpio.supabase.co/functions/v1/midtrans-webhook'
};

export interface MidtransTransaction {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    email: string;
    phone: string;
  };
  item_details: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export const createMidtransTransaction = async (transactionData: MidtransTransaction) => {
  try {
    const response = await fetch(MIDTRANS_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(MIDTRANS_CONFIG.serverKey + ':')}`
      },
      body: JSON.stringify(transactionData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating Midtrans transaction:', error);
    throw error;
  }
};

export const getTicketTypeName = (ticketId: string) => {
  const ticketTypes: { [key: string]: string } = {
    'fun-run': 'Fun Run (5K)',
    'half-marathon': 'Half Marathon (21K)',
    'full-marathon': 'Full Marathon (42K)'
  };
  return ticketTypes[ticketId] || ticketId;
};