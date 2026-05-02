import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { buildMediaItems, mediaStore, type MediaKind } from "@/lib/media-store";

const acceptMap: Record<MediaKind | "all", string> = {
  video: "video/*",
  music: "audio/*",
  photo: "image/*",
  file: "*/*",
  all: "*/*",
};

export function AddMediaButton({ kind = "all", label }: { kind?: MediaKind | "all"; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setLoading(true);
    try {
      const items = await buildMediaItems(e.target.files);
      mediaStore.add(items);
    } finally {
      setLoading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={ref}
        type="file"
        multiple
        accept={acceptMap[kind]}
        className="hidden"
        onChange={onChange}
      />
      <button
        onClick={() => ref.current?.click()}
        disabled={loading}
        className="fixed bottom-20 right-4 z-30 flex h-14 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-[0_8px_24px_oklch(0.62_0.24_27/0.45)] active:scale-95"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        {label ?? "Add files"}
      </button>
    </>
  );
}
