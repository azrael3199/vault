type Props = {
  filename: string;
};

const Overlay = ({ filename }: Props) => {
  return (
    <div className="h-full w-full bg-transparent absolute top-0 left-0 z-10">
      <span className="text-lg text-gray-100 bg-black/50 px-4 py-2 truncate">
        {filename}
      </span>
    </div>
  );
};

export default Overlay;
