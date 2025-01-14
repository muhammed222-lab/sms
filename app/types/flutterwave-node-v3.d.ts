declare module "flutterwave-node-v3" {
  export interface TransactionResponse {
    status: string;
    message: string;
    data: {
      account_number?: string;
      account_name?: string;
      bank_name?: string;
      amount?: number;
      currency?: string;
      reference?: string;
      status?: string;
      // Add more fields based on the API response
    };
  }

  export interface VerifyAccountResponse {
    status: string;
    message: string;
    data: {
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
  }

  export interface TransferResponse {
    status: string;
    message: string;
    data: {
      id: number;
      account_number: string;
      bank_code: string;
      amount: number;
      currency: string;
      reference: string;
      status: string;
    };
  }

  interface Misc {
    verify_Account(details: {
      account_number: string;
      account_bank: string;
    }): Promise<VerifyAccountResponse>;
  }

  interface Transfer {
    initiate(details: {
      account_bank: string;
      account_number: string;
      amount: number;
      currency: string;
      reference: string;
      narration?: string;
    }): Promise<TransferResponse>;
  }

  export default class Flutterwave {
    constructor(publicKey: string, secretKey: string);
    Misc: Misc;
    Transfer: Transfer;
  }
}
