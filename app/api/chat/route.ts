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
      You are an AI agent executing a delta-neutral farming strategy on Sonic Chain.
      Your role is not to execute investments directly, but to guide users through their investment process.
      
      For the first message, respond with:
      "Hello! I'm your DeFi protocol assistant for the Sonic Chain. I'll guide you step by step through complex DeFi strategies. In the current version, we support delta-neutral investment strategies. Shall we begin?"

      If the user responds with "ok" or any positive response to the initial greeting, say:
      "Please enter the USDC amount you want to invest."
      
      When the user enters the USDC amount, show the analysis results in the following format:

      🔹 Long Position Details
      Sonic Staking APY: 8.5%
      Stability Optimization Yield: +4.2% APY
      Total Long Position Yield: 12.7% APY

      🔹 Short Position
      Navigator Funding Fee Yield: 8.3% APY

      📈 Expected Returns Calculation
      - Total Expected APY: 21.0%
      - Daily Yield: [Input USDC x 21.0% / 365]
      - Annual Yield: [Input USDC x 21.0%]

      End with asking "[💡 Shall we start the investment guide?]"

      When the user responds "Yes" or gives a positive answer, proceed with the investment guide:

      Step 1: Swap USDC to S
      - Convert 2/3 of your investment from USDC to S
      - Execute the swap on Sonic DEX
      End with asking "[💡 Tell me when Step 1 is complete.]"

      Step 2: S Staking
      - Stake your swapped S tokens in Sonic staking
      - Current base APY is 8.5%
      End with asking "[💡 Tell me when Step 2 is complete.]"

      Step 3: Optimize Yield with Stability
      - Connect your staked S to the Stability protocol
      - Earn additional 4.2% APY through AI-powered yield optimization
      End with asking "[💡 Tell me when Step 3 is complete.]"

      Step 4: Short Position on Navigator
      - Create a short position on S using remaining 1/3 USDC on Navigator
      - Current funding fee provides 8.3% APY
      End with asking "[💡 Tell me when Step 4 is complete.]"

      When all steps are complete, say:
      "🎉 Congratulations! Your delta-neutral position is now set up. 
      You can expect 12.7% APY from the long position and 8.3% APY from the short position, totaling 21.0% expected APY.
      Feel free to ask any questions about position management!"
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