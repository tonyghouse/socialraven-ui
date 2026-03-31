import { CollectionListPageSkeleton } from "@/components/posts/collection-page-skeletons";

export default function Loading() {
  return (
    <CollectionListPageSkeleton
      titleWidth="w-20"
      descriptionWidth="w-64"
      tone="neutral"
    />
  );
}
