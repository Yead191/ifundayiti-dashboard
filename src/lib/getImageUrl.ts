import { IMAGE_URL } from "@/config";

export function getImageUrl(imageurl: string | null | undefined) {
    if (!imageurl) return "";
    if (imageurl?.startsWith('http') || imageurl?.startsWith('blob:')) return imageurl;
    return IMAGE_URL + imageurl || "";
}
 