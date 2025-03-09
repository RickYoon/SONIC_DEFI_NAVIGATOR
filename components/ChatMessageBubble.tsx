import markdownToHtml from "@/utils/markdownToHTML";
import type { Message } from "ai/react";
import { useMemo } from "react";

export function ChatMessageBubble(props: {
	message: Message;
	aiEmoji?: string;
	sources: any[];
	onOptionSelect?: (option: string) => void;
}) {
	const colorClassName =
		props.message.role === "user" ? "bg-transparent" : "bg-[#444654]";

	const content = useMemo(() => {
		// Maintain consistent line spacing with markdown processing
		const processedContent = props.message.content
			.split('\n')
			.map(line => {
				// Keep empty lines as is
				if (line.trim() === '') return '';
				// Process lines starting with emoji as headings
				if (line.match(/^[🔹📈💡]/)) {
					return `### ${line}`;
				}
				// Wrap normal text lines with p tags
				return line ? `<p class="my-1.5">${line}</p>` : '';
			})
			.join('\n');

		return markdownToHtml(processedContent);
	}, [props.message.content]);

	return (
		<div className={`${colorClassName} w-full`}>
			<div className="max-w-3xl mx-auto flex py-6 px-4">
				{props.message.role === "user" ? (
					<div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white mr-4">
						👤
					</div>
				) : (
					<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
						🤖
					</div>
				)}
				<div className="flex-1 text-white">
					<div 
						className="prose prose-invert max-w-none [&>h3]:mb-3 [&>h3]:mt-4 first:[&>h3]:mt-0 [&>p]:my-1.5 [&>ul]:my-1.5 [&>ul>li]:my-1.5 space-y-1.5"
						dangerouslySetInnerHTML={{ __html: content }}
					/>
					{props.sources && props.sources.length ? (
						<div className="mt-3">
							<details className="text-xs text-gray-400">
								<summary className="cursor-pointer">Sources</summary>
								<div className="mt-2 space-y-1">
									{props.sources.map((source, i) => (
										<div key={i} className="pl-4 border-l-2 border-gray-600">
											{source}
										</div>
									))}
								</div>
							</details>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
