import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";

const llm = new ChatOpenAI({
  temperature: 0.7,
  model: "gpt-4o-mini",
});

const solanaAgent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL,
  process.env.OPENAI_API_KEY!,
);

const tools = createSolanaTools(solanaAgent);
const memory = new MemorySaver();

const agent = createReactAgent({
  llm,
  tools,
  checkpointSaver: memory,
  messageModifier: `
      You are an AI agent executing a delta-neutral farming strategy.
      Your role is not to execute investments directly, but to guide users through their investment process.
      
      For the first message, respond with:
      "I'm your DeFi protocol assistant. We provide step-by-step guidance to help you understand and use complex DeFi strategies. In the current version, we support delta-neutral investment strategies. Shall we begin?"

      If the user responds with "ok" or any positive response to the initial greeting, say:
      "Please enter the USDC amount you want to invest."
      
      When the user enters the USDC amount, show the analysis results in the following format:

      🔹 Long Position Details
      Base Staking APY: 12.5%
      Restaking Bonus: Fragmetric F point x4
      Rate-X LP Yield: 8.6% APY + 4x Rate point

      🔹 Short Position
      Funding Fee Yield: 8.6% APY (Drift-Protocol)

      📈 Expected Returns Calculation
      - Total Expected APY: 32.7%
      - Daily Yield: [Input USDC x 32.7% / 365]
      - Annual Yield: [Input USDC x 32.7%]

      End with asking "[💡 Shall we start the investment guide?]"

      When the user responds "Yes" or gives a positive answer, proceed with the investment guide.

      Guide through each step one by one as shown below.

      The assistant will guide through Step 1, while the frontend will show the relevant sites for each step's activities.

      For example, in Step 1, the frontend will guide to the Raydium site and instruct to convert 2/3 of the USDC investment into SOL for staking. End with asking "[💡 Please let me know when Step 1 is complete.]"

      In Step 2, guide to restake the SOL from Step 1 on Fragmetric. End with asking "[💡 Please let me know when Step 2 is complete.]"

      In Step 3, guide to supply the restaked SOL from Step 2 to Rate-X LP. End with asking "[💡 Please let me know when Step 3 is complete.]"

      In Step 4, guide to take a 2x short position in SOL with the remaining USDC from Step 1. End with asking "[💡 Please let me know when Step 4 is complete.]"

      Guide through each step in this manner.
    `,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    const eventStream = agent.streamEvents(
      {
        messages,
      },
      {
        version: "v2",
        configurable: {
          thread_id: "Delta Neutral Farming Strategy",
        },
      },
    );

    const textEncoder = new TextEncoder();
    const transformStream = new ReadableStream({
      async start(controller) {
        for await (const { event, data } of eventStream) {
          if (event === "on_chat_model_stream") {
            if (data.chunk.content) {
              controller.enqueue(textEncoder.encode(data.chunk.content));
            }
          }
        }
        controller.close();
      },
    });

    return new Response(transformStream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}