declare module "flutterwave-node-v3" {
  interface VerifyAccountResponse {
    status: string;
    message: string;
    data?: {
      account_number: string;
      account_name: string;
    };
  }

  interface TransferResponse {
    status: string;
    message: string;
    data?: {
      id: string;
      status: string;
      reference: string;
      amount: number;
      currency: string;
      created_at: string;
      [key: string]: unknown; // Add additional fields as necessary
    }; // Replace `any` with the actual structure of the transfer response if known
  }

  interface Miscellaneous {
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
      narration?: string;
      currency: string;
      reference: string;
    }): Promise<TransferResponse>;
  }

  class Flutterwave {
    Transaction: any;
    constructor(publicKey: string, secretKey: string);

    Misc: Miscellaneous;
    Transfer: Transfer;
  }

  export default Flutterwave;
}
