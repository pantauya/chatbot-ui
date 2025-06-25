import { cn } from "~/lib/utils";
import { ThoughtMessage } from "./ThoughtMessage";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "USER" | "ASSISTANT";
  content: string;
  thought?: string;
}

export const ChatMessage = (props: ChatMessageProps) => {
  const isAssistant = props.role === "ASSISTANT";

  const sourceSplit = props.content.split(/Sumber:/i);
  const mainContent = sourceSplit[0].trim();
  const sourcePart = sourceSplit[1]?.trim();

  // Pisahkan jika ada banyak file
  const fileEntries = sourcePart
    ? sourcePart
        .split(",")
        .map((name) => {
          const [rawName, statusPart] = name.split(/Status Peraturan:/i);

          // Hilangkan tanda "**" jika ada di data mentah
          const cleanedName = rawName.replace(/\*{1,2}/g, "").trim();
          const cleanedStatus = statusPart?.replace(/\*{1,2}/g, "").trim() || null;

          return {
            name: cleanedName,
            status: cleanedStatus,
          };
        })
        .filter((entry) => entry.name.length > 0)
    : [];

  return (
    <>
      {props.thought && <ThoughtMessage thought={props.thought} />}

      <div
        className={`flex items-start gap-4 ${
          isAssistant ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <div
          className={`rounded-2xl p-4 max-w-[80%] ${
            isAssistant
              ? "bg-input text-accent-foreground"
              : "bg-muted text-accent-foreground"
          }`}
        >
          <div className={cn(isAssistant && "prose dark:prose-invert")}>
            <ReactMarkdown>{mainContent}</ReactMarkdown>

            {/* Tampilkan daftar file sumber */}
            {fileEntries.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                <span className="font-semibold mr-1">Sumber:</span>
                <ul className="list-none pl-0">
                  {fileEntries.map((entry, i) => {
                    const url = `http://localhost:8080/files/${encodeURIComponent(entry.name + ".pdf")}`;
                    return (
                      <li key={i} className="mb-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {entry.name}
                        </a>
                        {entry.status && (
                          <div className="text-gray-400 ml-2">
                            Status Peraturan: <span className="italic">{entry.status}</span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
