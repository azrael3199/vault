const NotFound = () => {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="flex flex-col gap-4 items-center">
        <h1 className="text-2xl font-semibold">Page Not Found</h1>
        <h3 className="text-md text-gray-500">
          Are you sure this is the right URL?
        </h3>
      </div>
    </div>
  );
};

export default NotFound;
