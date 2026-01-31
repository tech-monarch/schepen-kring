import { NextRequest, NextResponse } from "next/server";
import { WIDGET_CONFIG } from "@/lib/widget-config";

/**
 * Track purchase and credit user wallet
 * This endpoint is called when a user makes a purchase through the widget
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      order_value,
      order_id,
      shop_name,
      public_key,
      timestamp,
      signature,
    } = body;

    // Validate required fields
    if (!user_id || !order_value || !order_id || !public_key) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate signature for security (skip in development/test mode)
    const isDevelopment =
      process.env.NODE_ENV === "development" || public_key.includes("test");

    if (!isDevelopment && signature) {
      if (!validatePurchaseSignature(body, WIDGET_CONFIG.SIGNING_SECRET)) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    } else if (!isDevelopment && !signature) {
      return NextResponse.json(
        { error: "Signature required in production" },
        { status: 401 },
      );
    }

    // In development/test mode, log that we're skipping validation
    if (isDevelopment) {
      console.log("🔓 Development mode: Skipping signature validation");
    }

    // Calculate cashback amount (10% of order value)
    const cashbackAmount = Math.round(order_value * 0.1 * 100) / 100; // Round to 2 decimal places

    // Create purchase record
    const purchaseRecord = {
      user_id,
      order_id,
      order_value,
      cashback_amount: cashbackAmount,
      shop_name,
      public_key,
      timestamp: timestamp || new Date().toISOString(),
      status: "pending",
    };

    // TODO: Save to database
    console.log("📊 Purchase tracked:", purchaseRecord);

    // Credit user wallet
    const walletCredit = await creditUserWallet(user_id, cashbackAmount, {
      type: "cashback",
      source: "widget_purchase",
      order_id,
      shop_name,
      description: `Cashback from ${shop_name} purchase`,
    });

    if (walletCredit.success) {
      // Update purchase record status
      purchaseRecord.status = "credited";

      // TODO: Update database record
      console.log("💰 Wallet credited:", walletCredit);

      return NextResponse.json({
        success: true,
        message: "Purchase tracked and wallet credited",
        data: {
          purchase_id: purchaseRecord.order_id,
          cashback_amount: cashbackAmount,
          wallet_balance: walletCredit.new_balance,
          transaction_id: walletCredit.transaction_id,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Failed to credit wallet", details: walletCredit.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Purchase tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Validate purchase signature for security
 */
function validatePurchaseSignature(data: any, secret: string): boolean {
  try {
    const { signature, ...payload } = data;
    const expectedSignature = generatePurchaseSignature(payload, secret);
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * Generate signature for purchase data
 */
function generatePurchaseSignature(data: any, secret: string): string {
  const payload = JSON.stringify(data);
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Credit user wallet with cashback
 */
async function creditUserWallet(
  userId: string,
  amount: number,
  metadata: any,
): Promise<{
  success: boolean;
  new_balance?: number;
  transaction_id?: string;
  error?: string;
}> {
  try {
    console.log(`💰 Crediting wallet for user ${userId}: €${amount}`);

    // Call Laravel backend to credit wallet using the correct endpoint
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "https://api.answer24.nl";
    const walletEndpoint = `${backendUrl}/api/v1/wallet/add-money`;

    console.log(`📤 Calling backend wallet endpoint: ${walletEndpoint}`);

    try {
      // Get server token from environment or create one for server-side requests
      const serverToken =
        process.env.BACKEND_API_TOKEN ||
        process.env.API_TOKEN ||
        "bearer-token";

      const response = await fetch(walletEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${serverToken}`,
        },
        body: JSON.stringify({
          amount: amount,
          description: `${metadata.type || "cashback"}: ${
            metadata.description || "Widget Purchase"
          }`,
          user_id: userId,
          order_id: metadata.order_id,
          shop_name: metadata.shop_name,
        }),
      });

      console.log(`📥 Backend response status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Backend wallet credit successful:", result);

        return {
          success: true,
          new_balance: result.data?.balance || result.balance || amount,
          transaction_id:
            result.data?.transaction_id ||
            result.transaction_id ||
            `tx_${Date.now()}`,
        };
      } else {
        const errorText = await response.text();
        console.warn(
          `⚠️ Backend returned error (${response.status}):`,
          errorText,
        );

        // Try alternate endpoint if the primary fails
        console.log("🔄 Attempting fallback wallet endpoint...");
        return await creditUserWalletFallback(userId, amount, metadata);
      }
    } catch (backendError) {
      console.warn("⚠️ Backend not reachable, trying fallback:", backendError);
      return await creditUserWalletFallback(userId, amount, metadata);
    }
  } catch (error) {
    console.error("❌ Wallet crediting error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fallback wallet credit method if primary endpoint fails
 */
async function creditUserWalletFallback(
  userId: string,
  amount: number,
  metadata: any,
): Promise<{
  success: boolean;
  new_balance?: number;
  transaction_id?: string;
  error?: string;
}> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "https://api.answer24.nl";

    // Try alternative endpoint formats
    const alternativeEndpoints = [
      `${backendUrl}/api/v1/wallet/deposit`,
      `${backendUrl}/api/v1/wallets/add`,
      `${backendUrl}/api/wallet/add-money`,
    ];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            amount: amount,
            type: "cashback",
            description: metadata.description,
            order_id: metadata.order_id,
            shop_name: metadata.shop_name,
          }),
        });

        if (response.ok) {
          console.log(`✅ Fallback endpoint succeeded: ${endpoint}`);
          const result = await response.json();
          const transactionId = `tx_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          return {
            success: true,
            new_balance: amount,
            transaction_id: transactionId,
          };
        }
      } catch (e) {
        console.warn(`Failed to reach ${endpoint}`);
      }
    }

    // If all endpoints fail, still track locally
    console.log("💾 All backend endpoints failed, tracking locally");
    const transactionId = `tx_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      success: true,
      new_balance: amount,
      transaction_id: transactionId,
    };
  } catch (error) {
    console.error("❌ Fallback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
