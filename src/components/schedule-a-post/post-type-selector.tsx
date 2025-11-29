export default function PostTypeSelector({ postType, setPostType } :any) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground mr-3">Post Type</label>

      <select
        value={postType}
        onChange={e=> setPostType(e.target.value)}
        className="px-4 py-3 rounded-xl bg-card border  border-border/30 
        backdrop-blur-lg hover:border-primary/40 transition text-foreground shadow-sm"
      >
        <option value="IMAGE">Image</option>
        <option value="VIDEO">Video</option>
        <option value="TEXT">Text</option>
      </select>
    </div>
  );
}
