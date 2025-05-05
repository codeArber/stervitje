import { useTikTokThumbnail } from "@/api/tiktok";

export default function TikTokPreview({ reference }: { reference: string }) {

    const { data: thumbnail } = useTikTokThumbnail(reference);
    return (
        <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover rounded" />
    );
}