import { TransactionResult } from "@/types";
import { Program } from "@coral-xyz/anchor";
import { IdlInstruction } from "@coral-xyz/anchor/dist/cjs/idl";
import { Connection, PublicKey, Transaction, RpcResponseAndContext, SignatureResult } from "@solana/web3.js";
import { processInstructionArgs } from "./argProcessor";

interface ExecuteTransactionParams {
  program: Program;
  instruction: IdlInstruction;
  args: Record<string, unknown>;
  accounts: Record<string, string>;
  connection: Connection;
  publicKey: PublicKey;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: { skipPreflight?: boolean }
  ) => Promise<string>;
  programTypes?: Array<{ name: string; type: unknown }>;
}

export const executeTransaction = async ({
  program,
  instruction,
  args,
  accounts,
  connection,
  publicKey,
  sendTransaction,
  programTypes,
}: ExecuteTransactionParams): Promise<TransactionResult> => {
  try {
    // Verify wallet is connected
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    // Process arguments
    const processedArgs = processInstructionArgs(instruction, args, programTypes);
    console.log("Final processed args:", processedArgs);

    // Create method builder
    const methodBuilder = program.methods[instruction.name](...processedArgs);

    // Resolve accounts
    const accountsObject: Record<string, PublicKey> = {};

    for (const [name, value] of Object.entries(accounts)) {
      if (value) {
        try {
          accountsObject[name] = new PublicKey(value);
        } catch (err) {
          console.warn(`Invalid public key for account ${name}:`, err);
          throw new Error(`Invalid public key for account "${name}": ${value}`);
        }
      }
    }

    console.log("Accounts object:", accountsObject);

    // Build transaction
    const transaction = await methodBuilder.accounts(accountsObject).transaction();

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    console.log("Transaction prepared, requesting wallet approval...");

    // Send transaction (this will trigger wallet approval)
    const txSignature = await sendTransaction(transaction, connection, {
      skipPreflight: false,
    });

    console.log("Transaction sent with signature:", txSignature);

    // Confirm transaction with timeout
    const confirmationPromise = connection.confirmTransaction(
      {
        signature: txSignature,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed"
    );

    // Add timeout to confirmation
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000)
    );

    const confirmation: RpcResponseAndContext<SignatureResult> = await Promise.race([
      confirmationPromise, 
      timeoutPromise
    ]);

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      );
    }

    console.log("Transaction confirmed successfully");

    return { signature: txSignature };
    
  } catch (error: any) {
    // Handle specific wallet errors
    if (error.message?.includes("Plugin Closed") || 
        error.message?.includes("User rejected")) {
      throw new Error("Transaction cancelled by user");
    }
    
    if (error.message?.includes("Wallet not connected")) {
      throw new Error("Please connect your wallet first");
    }

    // Re-throw with more context
    console.error("Transaction execution error:", error);
    throw new Error(`Transaction failed: ${error.message || error}`);
  }
};