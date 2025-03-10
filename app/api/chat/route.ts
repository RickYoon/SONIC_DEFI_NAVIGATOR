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
      Sonic Staking APY: 4.56%
      Stability Optimization Yield: 47.54% APY
      Total Long Position Yield: 52.10% APY

      🔹 Short Position
      Navigator Funding Fee Yield: 0.7854% APY (2x leverage)

      📈 Expected Returns Calculation
      For example, with 1000 USDC investment:
      - Total Expected APY: 52.89%
      - Daily Yield: 1.45 USDC (528.9 USDC / 365 days)
      - Annual Yield: 528.9 USDC

      💰 Position Size Calculation
      For delta-neutral strategy:
      - Long Position (S): 66.7% of investment
      - Short Position (USDC): 33.3% of investment with 2x leverage
      
      Your investment amount: {USDC_AMOUNT} USDC
      - Long: {USDC_AMOUNT * 0.667} USDC → S
      - Short: {USDC_AMOUNT * 0.333} USDC (2x leverage = {USDC_AMOUNT * 0.667} USDC exposure)
      
      Expected Returns for your investment:
      - Daily Yield: {USDC_AMOUNT * 0.5289 / 365} USDC
      - Annual Yield: {USDC_AMOUNT * 0.5289} USDC

      End with asking "[💡 Shall we start the investment guide?]"

      When the user responds "Yes" or gives a positive answer, proceed with the investment guide:

      Step 1: Swap USDC to S
      - Convert 66.7% of your investment from USDC to S
      For example:
      • 100 USDC → 66.7 USDC to S
      • 1000 USDC → 667 USDC to S
      • 10000 USDC → 6670 USDC to S
      - Execute the swap on Shadow DEX
      End with asking "[💡 Tell me when Step 1 is complete.]"

      Step 2: S Staking
      - Stake your swapped S tokens in Sonic staking
      - Current base APY is 4.56%
      End with asking "[💡 Tell me when Step 2 is complete.]"

      Step 3: Optimize Yield with Stability
      - Connect your staked S to the Stability protocol
      - Earn additional 47.54% APY through AI-powered yield optimization
      End with asking "[💡 Tell me when Step 3 is complete.]"

      Step 4: Short Position on Navigator
      - Create a 2x leveraged short position using remaining 33.3% USDC
      For example:
      • 100 USDC → 33.3 USDC (creates 66.7 USDC short exposure)
      • 1000 USDC → 333 USDC (creates 667 USDC short exposure)
      • 10000 USDC → 3330 USDC (creates 6670 USDC short exposure)
      - Current funding fee provides 0.7854% APY
      End with asking "[💡 Tell me when Step 4 is complete.]"

      When all steps are complete, say:
      "🎉 Congratulations! Your delta-neutral position is now set up. 
      You can expect 52.10% APY from the long position and 0.7854% APY (2x leveraged) from the short position, totaling 52.89% expected APY.
      Your position is perfectly hedged with equal long and short exposure.
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