import {ethers} from "ethers";
import type { GetStatus, RouteResponse } from "@0xsquid/sdk/dist/types";

import { getSDK } from "./axelar-sdk"




export async function getRoute(
    fromAddress: string,
    fromChain: string,
    fromToken: string,
    fromAmount: string,
    toAddress: string,
    toChain: string,
    toToken: string,
): Promise<RouteResponse>{
    try{
        let squid = getSDK();
        squid.init();
        let params = {
            fromAddress,
            fromChain,
            fromToken,
            fromAmount,
            toAddress,
            toChain,
            toToken,
        }
        let route = await squid.getRoute(params);
        console.log("[** SQUID **] Route: ", JSON.stringify(route, null, 2))
        return route;
    }catch(e: any){
        console.error(e)
    }
}


// Function to approve the transactionRequest.target to spend fromAmount of fromToken
const approveSpending = async (transactionRequestTarget: string, fromToken: string, fromAmount: string) => {
    const erc20Abi = [
      "function approve(address spender, uint256 amount) public returns (bool)"
    ];
    const tokenContract = new ethers.Contract(fromToken, erc20Abi);
    try {
      const tx = await tokenContract.approve(transactionRequestTarget, fromAmount);
      await tx.wait();
      console.log(`Approved ${fromAmount} tokens for ${transactionRequestTarget}`);
    } catch (error) {
      console.error('Approval failed:', error);
      throw error;
    }
};


export type MultichainTransferParams = {
    fromAddress: string,
    fromChain: string,
    fromToken: string,
    fromAmount: string,
    toAddress: string,
    toChain: string,
    toToken: string
}


const multichainTransfer = async (params: MultichainTransferParams) => {
    try{
        const {fromAddress, fromChain, fromToken, fromAmount, toAddress, toChain, toToken} = params;
        const {route, requestId} = await getRoute(fromAddress, fromChain, fromToken, fromAmount, toAddress, toChain, toToken);
        console.log("Calculated route:", route.estimate.toAmount);

        if(!route.transactionRequest){
            console.error("No transaction request found");
            return;
        }

        let target: string;
        if('target' in route.transactionRequest){
            target = route.transactionRequest.target;  
        }else {
            console.error("Cannot determine target address from transaction request");
            console.log("Transaction request:", route.transactionRequest);
            return;
        }
        await approveSpending(target, fromToken, fromAmount);
        const squid = getSDK();

        // Execute the swap transaction
        const txResponse = await squid.executeRoute({
            signer: signer as any, // Cast to any to bypass type checking issues
            route,
        });

        // Handle the transaction response - could be an ethers v6 TransactionResponse or something else
        let txHash: string = 'unknown';
        
        if (txResponse && typeof txResponse === 'object') {
            if ('hash' in txResponse) {
            // This is an ethers TransactionResponse
            txHash = txResponse.hash as string;
            await (txResponse as any).wait?.(); // Wait for the transaction to be mined if possible
            } else if ('transactionHash' in txResponse) {
            // This might be a v5 style response or custom Squid format
            txHash = (txResponse as any).transactionHash as string;
            } else {
            // Fallback - try to find a hash property
            txHash = (txResponse as any).hash as string || 'unknown';
            }
        }

        // Show the transaction receipt with Axelarscan link
        const axelarScanLink = "https://axelarscan.io/gmp/" + txHash;
        console.log(`Finished! Check Axelarscan for details: ${axelarScanLink}`);

        // Wait a few seconds before checking the status
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Parameters for checking the status of the transaction
        const getStatusParams: GetStatus = {
            transactionId: txHash,
            requestId: requestId,
            integratorId: import.meta.env.VITE_SQUID_INTEGRATOR_ID
        };

        const completedStatuses = ["success", "partial_success", "needs_gas", "not_found"];
        const maxRetries = 10; // Maximum number of retries for status check
        let retryCount = 0;
        
        // Get the initial status
        let status = await squid.getStatus(getStatusParams);
        console.log(`Initial route status: ${status.squidTransactionStatus}`);

        // Loop to check the transaction status until it is completed or max retries are reached
        do {
            try {
            // Wait a few seconds before checking the status
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Retrieve the transaction's route status
            status = await squid.getStatus(getStatusParams);

            // Display the route status
            console.log(`Route status: ${status.squidTransactionStatus}`);

            } catch (error: unknown) {
            // Handle error if the transaction status is not found
            if (error instanceof Error && (error as any).response && (error as any).response.status === 404) {
                retryCount++;
                if (retryCount >= maxRetries) {
                console.error("Max retries reached. Transaction not found.");
                break;
                }
                console.log("Transaction not found. Retrying...");
                continue;
            } else {
                throw error;
            }
            }

        } while (status && !completedStatuses.includes(status.squidTransactionStatus!));

        // Wait for the transaction to be executed
        console.log("Swap transaction executed:", txHash);
    }catch(e: any){
        console.log("[*] Error:- ", e.message);
    }
}


// const params = {
//     fromAddress: address,
//     fromChain: fromChainId,
//     fromToken: fromToken,
//     fromAmount: amount,
//     toChain: toChainId,
//     toToken: toToken,
//     toAddress: await signer.getAddress()
// };


// console.log("Parameters:", params); // Printing the parameters for QA

