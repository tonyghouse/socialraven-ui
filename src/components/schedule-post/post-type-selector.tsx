
export default function PostTypeSelector({ postType, setPostType }: any) {
  const types = [
    { value: 'IMAGE', label: 'Image' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'TEXT', label: 'Text' }
  ];

  return (
    <div className="inline-flex gap-1 p-1 bg-gray-100 rounded-lg">
      {types.map(type => (
        <button
          key={type.value}
          onClick={() => setPostType(type.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 
            ${postType === type.value 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}