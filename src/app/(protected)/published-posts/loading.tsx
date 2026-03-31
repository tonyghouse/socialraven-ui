import { CollectionListPageSkeleton } from "@/components/posts/collection-page-skeletons";

export default function Loading() {
  return (
    <CollectionListPageSkeleton
      titleWidth="w-32"
      descriptionWidth="w-80"
      tone="success"
    />
  );
}
