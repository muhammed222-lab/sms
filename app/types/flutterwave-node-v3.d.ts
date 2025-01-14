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
    };
  }

  interface VerifyAccountDetails {
    account_number: string;
    account_bank: string;
  }

  interface InitiateTransferDetails {
    account_bank: string;
    account_number: string;
    amount: number;
    narration?: string;
    currency: string;
    reference: string;
  }

  interface Miscellaneous {
    verify_Account(
      details: VerifyAccountDetails
    ): Promise<VerifyAccountResponse>;
  }

  interface Transfer {
    initiate(details: InitiateTransferDetails): Promise<TransferResponse>;
  }

  class Flutterwave {
    Misc: Miscellaneous;
    Transfer: Transfer;

    constructor(publicKey: string, secretKey: string);
  }

  export default Flutterwave;
}
