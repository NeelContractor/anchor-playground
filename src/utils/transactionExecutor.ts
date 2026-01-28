import { TransactionResult } from "@/types";
import { Program } from "@coral-xyz/anchor";
import { IdlInstruction } from "@coral-xyz/anchor/dist/cjs/idl";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
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

    // ENHANCED: Verify accounts exist on-chain
    console.log("Verifying accounts exist on-chain...");
    for (const [name, pubkey] of Object.entries(accountsObject)) {
      try {
        const accountInfo = await connection.getAccountInfo(pubkey);
        if (!accountInfo) {
          console.warn(`⚠️  Account "${name}" (${pubkey.toBase58()}) does not exist on-chain!`);
          console.warn(`   This may cause transaction simulation to fail`);
        } else {
          console.log(`✓ Account "${name}" exists, owner: ${accountInfo.owner.toBase58()}`);
        }
      } catch (err) {
        console.error(`Error checking account "${name}":`, err);
      }
    }

    // ENHANCED: Check wallet balance
    const balance = await connection.getBalance(publicKey);
    console.log(`Wallet balance: ${(balance / 1e9).toFixed(6)} SOL`);
    
    if (balance < 5000) { // 0.000005 SOL minimum for fees
      throw new Error(
        `Insufficient SOL balance for transaction fees. ` +
        `Current balance: ${(balance / 1e9).toFixed(6)} SOL. ` +
        `Please add some SOL to your wallet.`
      );
    }

    // Build transaction
    const transaction = await methodBuilder.accounts(accountsObject).transaction();

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    console.log("Transaction prepared, requesting wallet approval...");

    // Send transaction
    const txSignature = await sendTransaction(transaction, connection, {
      skipPreflight: false,
    });

    console.log("Transaction sent with signature:", txSignature);

    // Confirm transaction
    const confirmation = await connection.confirmTransaction({
      signature: txSignature,
      blockhash,
      lastValidBlockHeight,
    });

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      );
    }

    return { signature: txSignature };
  } catch (error: unknown) {
    // Enhanced error logging
    console.error("Transaction error details:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : '';
    
    // Check if user cancelled the transaction
    if (
      errorMessage.includes('User rejected') ||
      errorMessage.includes('Transaction cancelled') ||
      errorMessage.includes('Plugin Closed') ||
      errorName === 'WalletSendTransactionError'
    ) {
      throw new Error('Transaction cancelled by user');
    }
    
    // Check for simulation errors (-32002)
    if (errorMessage.includes('-32002') || errorMessage.includes('simulation failed')) {
      // Try to provide helpful context
      const helpfulMessage = 
        'Transaction simulation failed. Common causes:\n\n' +
        '1. Account does not exist on this network\n' +
        '2. Insufficient SOL balance for transaction fees\n' +
        '3. Invalid account permissions or ownership\n' +
        '4. Network mismatch (check your RPC endpoint)\n' +
        '5. Program state not initialized\n\n' +
        'Check the console logs above for account verification details.\n\n' +
        `Original error: ${errorMessage}`;
      
      throw new Error(helpfulMessage);
    }
    
    // Re-throw other errors
    throw error;
  }
};