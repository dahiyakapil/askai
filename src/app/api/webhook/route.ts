import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import {
  CallEndedEvent,
  CallTranscriptionReadyEvent,
  CallSessionParticipantLeftEvent,
  CallRecordingReadyEvent,
  CallSessionStartedEvent,
} from "@stream-io/node-sdk";
import { error } from "console";
import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: "Missing signature or API key" },
      { status: 400 }
    );
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = (payload as Record<string, unknown>)?.type;

  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.id, meetingId),
          not(eq(meetings.status, "completed")),
          not(eq(meetings.status, "active")),
          not(eq(meetings.status, "cancelled")),
          not(eq(meetings.status, "processing"))
        )
      );

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 400 });
    }

    await db
      .update(meetings)
      .set({
        status: "active",
        startedAt: new Date(),
      })
      .where(eq(meetings.id, existingMeeting.id));

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 400 });
    }

    const call = streamVideo.video.call("default", meetingId);
    const realtimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY!,
      agentUserId: existingAgent.id,
    });

    realtimeClient.updateSession({
      instructions: existingAgent.instructions,
    });
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const call = streamVideo.video.call("default", meetingId);
    await call.end();
  }

  return NextResponse.json({ status: "ok" });
}



// import { db } from "@/db";
// import { agents, meetings } from "@/db/schema";
// import { streamVideo } from "@/lib/stream-video";
// import {
//   CallSessionParticipantLeftEvent,
//   CallSessionStartedEvent,
// } from "@stream-io/node-sdk";
// import { and, eq, not } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// function verifySignatureWithSDK(body: string, signature: string): boolean {
//   return streamVideo.verifyWebhook(body, signature);
// }

// export async function POST(req: NextRequest) {
//   const signature = req.headers.get("x-signature");
//   const apiKey = req.headers.get("x-api-key");

//   if (!signature || !apiKey) {
//     console.error("❌ Missing signature or API key");
//     return NextResponse.json(
//       { error: "Missing signature or API key" },
//       { status: 400 }
//     );
//   }

//   const body = await req.text();

//   if (!verifySignatureWithSDK(body, signature)) {
//     console.error("❌ Invalid signature");
//     return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
//   }

//   let payload: unknown;

//   try {
//     payload = JSON.parse(body) as Record<string, unknown>;
//   } catch (err) {
//     console.error("❌ Invalid JSON:", err);
//     return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
//   }

//   const eventType = (payload as Record<string, unknown>)?.type;
//   console.log("📨 Webhook Event Type:", eventType);

//   try {
//     if (eventType === "call.session_started") {
//       const event = payload as CallSessionStartedEvent;
//       const meetingId = event.call.custom?.meetingId;

//       if (!meetingId) {
//         console.error("❌ Missing meetingId in event");
//         return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
//       }

//       console.log("🔎 Looking up meeting:", meetingId);

//       const [existingMeeting] = await db
//         .select()
//         .from(meetings)
//         .where(
//           and(
//             eq(meetings.id, meetingId),
//             not(eq(meetings.status, "completed")),
//             not(eq(meetings.status, "active")),
//             not(eq(meetings.status, "cancelled")),
//             not(eq(meetings.status, "processing"))
//           )
//         );

//       if (!existingMeeting) {
//         console.error("❌ Meeting not found or already active:", meetingId);
//         return NextResponse.json({ error: "Meeting not found" }, { status: 400 });
//       }

//       console.log("✅ Meeting found:", existingMeeting);

//       await db
//         .update(meetings)
//         .set({
//           status: "active",
//           startedAt: new Date(),
//         })
//         .where(eq(meetings.id, existingMeeting.id));

//       const [existingAgent] = await db
//         .select()
//         .from(agents)
//         .where(eq(agents.id, existingMeeting.agentId));

//       if (!existingAgent) {
//         console.error("❌ Agent not found for ID:", existingMeeting.agentId);
//         return NextResponse.json({ error: "Agent not found" }, { status: 400 });
//       }

//       console.log("🤖 Agent found:", existingAgent);

//       const call = streamVideo.video.call("default", meetingId);

//       let realtimeClient;
//       try {
//         realtimeClient = await streamVideo.video.connectOpenAi({
//           call,
//           openAiApiKey: process.env.OPENAI_API_KEY!,
//           agentUserId: existingAgent.id,
//         });
//         console.log("✅ Connected to OpenAI agent");
//       } catch (err) {
//         console.error("❌ Failed to connect to OpenAI:", err);
//         return NextResponse.json(
//           { error: "Failed to connect OpenAI agent", details: `${err}` },
//           { status: 500 }
//         );
//       }

//       try {
//         realtimeClient.updateSession({
//           instructions: existingAgent.instructions,
//         });
//         console.log("🧠 Agent instructions updated");
//       } catch (err) {
//         console.error("❌ Failed to update agent instructions:", err);
//       }
//     } else if (eventType === "call.session_participant_left") {
//       const event = payload as CallSessionParticipantLeftEvent;
//       const meetingId = event.call_cid.split(":")[1];

//       if (!meetingId) {
//         console.error("❌ Missing meetingId in participant_left event");
//         return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
//       }

//       const call = streamVideo.video.call("default", meetingId);
//       await call.end();
//       console.log("📞 Call ended for meeting:", meetingId);
//     }
//   } catch (err) {
//     console.error("❌ Unexpected error during event handling:", err);
//     return NextResponse.json({ error: "Server error", details: `${err}` }, { status: 500 });
//   }

//   return NextResponse.json({ status: "ok" });
// }







// import { db } from "@/db";
// import { agents, meetings } from "@/db/schema";
// import { streamVideo } from "@/lib/stream-video";
// import {
//   CallSessionStartedEvent,
//   CallSessionParticipantLeftEvent,
//   ClosedCaptionEvent,
// } from "@stream-io/node-sdk";
// import { and, eq, not } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// // Track connected OpenAI clients
// const openAiClients = new Map<string, any>();

// function verifySignatureWithSDK(body: string, signature: string): boolean {
//   return streamVideo.verifyWebhook(body, signature);
// }

// export async function POST(req: NextRequest) {
//   const signature = req.headers.get("x-signature");
//   const apiKey = req.headers.get("x-api-key");

//   if (!signature || !apiKey) {
//     console.error("❌ Missing signature or API key");
//     return NextResponse.json({ error: "Missing signature or API key" }, { status: 400 });
//   }

//   const body = await req.text();

//   if (!verifySignatureWithSDK(body, signature)) {
//     console.error("❌ Invalid signature");
//     return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
//   }

//   let payload: unknown;
//   try {
//     payload = JSON.parse(body) as Record<string, unknown>;
//   } catch (err) {
//     console.error("❌ Invalid JSON:", err);
//     return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
//   }

//   const eventType = (payload as Record<string, unknown>)?.type;
//   console.log("📨 Webhook Event Type:", eventType);

//   try {
//     // 1️⃣ Session Started
//     if (eventType === "call.session_started") {
//       const event = payload as CallSessionStartedEvent;
//       const meetingId = event.call.custom?.meetingId;

//       if (!meetingId) {
//         console.error("❌ Missing meetingId in event");
//         return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
//       }

//       console.log("🔎 Looking up meeting:", meetingId);

//       const [existingMeeting] = await db
//         .select()
//         .from(meetings)
//         .where(eq(meetings.id, meetingId)); // Allow all statuses for now

//       if (!existingMeeting) {
//         console.error("❌ Meeting not found:", meetingId);
//         return NextResponse.json({ error: "Meeting not found" }, { status: 400 });
//       }

//       console.log("✅ Meeting found:", existingMeeting);

//       // Update only if not already active
//       if (existingMeeting.status !== "active") {
//         await db
//           .update(meetings)
//           .set({
//             status: "active",
//             startedAt: new Date(),
//           })
//           .where(eq(meetings.id, meetingId));
//       }

//       const [agent] = await db
//         .select()
//         .from(agents)
//         .where(eq(agents.id, existingMeeting.agentId));

//       if (!agent) {
//         console.error("❌ Agent not found for:", existingMeeting.agentId);
//         return NextResponse.json({ error: "Agent not found" }, { status: 400 });
//       }

//       console.log("🤖 Agent found:", agent);

//       const call = streamVideo.video.call("default", meetingId);

//       let realtimeClient;
//       try {
//         realtimeClient = await streamVideo.video.connectOpenAi({
//           call,
//           openAiApiKey: process.env.OPENAI_API_KEY!,
//           agentUserId: agent.id,
//         });

//         openAiClients.set(meetingId, realtimeClient);
//         console.log("✅ Connected to OpenAI agent");

//         realtimeClient.updateSession({ instructions: agent.instructions });
//         console.log("🧠 Agent instructions updated");
//       } catch (err) {
//         console.error("❌ Failed to connect/update agent:", err);
//         return NextResponse.json({ error: "OpenAI error", details: `${err}` }, { status: 500 });
//       }
//     }

//     // 2️⃣ Participant Left
//     else if (eventType === "call.session_participant_left") {
//       const event = payload as CallSessionParticipantLeftEvent;
//       const meetingId = event.call_cid?.split(":")[1];

//       if (!meetingId) {
//         console.error("❌ Missing meetingId");
//         return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
//       }

//       const call = streamVideo.video.call("default", meetingId);
//       await call.end();
//       console.log("📞 Call ended for meeting:", meetingId);
//     }

//     // 3️⃣ Closed Caption
//     else if (eventType === "call.closed_caption") {
//       const event = payload as ClosedCaptionEvent;
//       const meetingId = event.call_cid?.split(":")[1];
//       const userText = event.closed_caption?.text;

//       if (!meetingId || !userText) {
//         console.warn("⚠️ Caption missing meetingId or text", event);
//         return NextResponse.json({ error: "Caption missing data" }, { status: 400 });
//       }

//       console.log("🗣️ User said:", userText);

//       const client = openAiClients.get(meetingId);
//       if (!client) {
//         console.error("❌ No OpenAI client for meeting:", meetingId);
//         return NextResponse.json({ error: "No agent found" }, { status: 400 });
//       }

//       try {
//         await client.sendInput(userText);
//         console.log("📤 Sent input to agent");
//       } catch (err) {
//         console.error("❌ Failed to send to OpenAI:", err);
//       }
//     }

//   } catch (err) {
//     console.error("❌ Unexpected error:", err);
//     return NextResponse.json({ error: "Server error", details: `${err}` }, { status: 500 });
//   }

//   return NextResponse.json({ status: "ok" });
// }
