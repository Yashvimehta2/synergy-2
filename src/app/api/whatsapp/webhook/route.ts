import { NextResponse } from "next/server";

// WhatsApp Cloud API Webhook Handler

// GET: Webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "gigid-webhook-verify-token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST: Handle incoming messages
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "no message" });
    }

    const from = message.from;
    const text = message.text?.body?.trim().toLowerCase();

    // Menu-driven responses
    let responseText: string;

    switch (text) {
      case "1":
      case "work summary":
      case "काम का सारांश":
        responseText = generateWorkSummary("en");
        break;
      case "2":
      case "share link":
      case "लिंक शेयर करो":
        responseText = generateShareLink();
        break;
      case "3":
      case "hindi":
      case "हिंदी":
        responseText = generateMainMenu("hi");
        break;
      case "4":
      case "english":
      case "अंग्रेज़ी":
        responseText = generateMainMenu("en");
        break;
      default:
        responseText = generateMainMenu("en");
        break;
    }

    // In production, would send via WhatsApp Cloud API:
    // POST https://graph.facebook.com/v17.0/{phone_number_id}/messages
    const responsePayload = {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: responseText },
    };

    console.log("[WhatsApp Webhook] Response:", responsePayload);

    return NextResponse.json({
      status: "processed",
      response: responsePayload,
    });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

function generateMainMenu(lang: string): string {
  if (lang === "hi") {
    return `🆔 *GigID - गिग वर्कर पहचान*\n\nनमस्ते! मैं GigID बॉट हूँ।\nकृपया एक विकल्प चुनें:\n\n1️⃣ काम का सारांश देखें\n2️⃣ शेयर लिंक बनाएं\n3️⃣ हिंदी\n4️⃣ English\n\nकोई भी नंबर भेजें 👆`;
  }
  return `🆔 *GigID - Gig Worker Identity*\n\nHello! I'm the GigID Bot.\nPlease choose an option:\n\n1️⃣ View Work Summary\n2️⃣ Generate Share Link\n3️⃣ हिंदी\n4️⃣ English\n\nSend any number 👆`;
}

function generateWorkSummary(lang: string): string {
  // Mock work summary
  if (lang === "hi") {
    return `📊 *आपका कार्य सारांश*\n\n🍕 Zomato: 1,247 डिलीवरी | ⭐ 4.8\n🚗 Uber: 2,340 राइड्स | ⭐ 4.7\n🛵 Swiggy: 890 डिलीवरी | ⭐ 4.6\n\n💰 कुल कमाई: ₹9,70,500\n🏆 विश्वास स्कोर: 78/100\n✅ 3 सत्यापित प्रमाणपत्र\n\nमेन मेन्यू के लिए "menu" भेजें`;
  }
  return `📊 *Your Work Summary*\n\n🍕 Zomato: 1,247 deliveries | ⭐ 4.8\n🚗 Uber: 2,340 trips | ⭐ 4.7\n🛵 Swiggy: 890 deliveries | ⭐ 4.6\n\n💰 Total Earnings: ₹9,70,500\n🏆 Trust Score: 78/100\n✅ 3 Verified Credentials\n\nSend "menu" for main menu`;
}

function generateShareLink(): string {
  const token = Math.random().toString(36).substring(2, 15);
  return `🔗 *Secure Verification Link*\n\nShare this link with your bank or employer:\n\nhttps://gigid.app/verify/${token}\n\n⏰ Valid for 24 hours\n🔒 Zero-Knowledge Proof - your exact data is never shared\n\nSend "menu" for main menu`;
}
