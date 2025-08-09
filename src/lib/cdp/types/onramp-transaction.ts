import type { Address } from "viem";

import type { Amount } from "@/lib/cdp/types/amount";
import type { TransactionsResponse } from "@/lib/cdp/types/transactions-response";

export enum OnrampTransactionStatus {
  InProgress = "ONRAMP_TRANSACTION_STATUS_IN_PROGRESS",
  Success = "ONRAMP_TRANSACTION_STATUS_SUCCESS",
  Failed = "ONRAMP_TRANSACTION_STATUS_FAILED",
}

export enum OnrampTransactionType {
  BuyAndSend = "ONRAMP_TRANSACTION_TYPE_BUY_AND_SEND",
  Send = "ONRAMP_TRANSACTION_TYPE_SEND",
}

export enum PaymentMethod {
  Card = "CARD",
  AchBankAccount = "ACH_BANK_ACCOUNT",
  ApplePay = "APPLE_PAY",
  FiatWallet = "FIAT_WALLET",
  CryptoWallet = "CRYPTO_WALLET",
}

export enum Experience {
  Send = "send",
  Buy = "buy",
}

export type OnrampTransaction = {
  status: OnrampTransactionStatus;
  purchase_currency: string;
  purchase_network: string;
  purchase_amount: Amount;
  payment_total: Amount;
  payment_subtotal: Amount;
  payment_total_usd: Amount;
  coinbase_fee: Amount;
  network_fee: Amount;
  exchange_rate: Amount;
  country: string;
  user_id: string;
  user_type: string;
  payment_method: PaymentMethod;
  tx_hash: Address;
  transaction_id: string;
  wallet_address: Address;
  contract_address: string;
  type: OnrampTransactionType;
  created_at: string;
  completed_at: string;
  failure_reason: string;
  end_partner_name: string;
  partner_user_ref: string;
};

export type OnrampTransactionsResponse =
  TransactionsResponse<OnrampTransaction>;
