export default function FeaturedBanners() {
  return (
    <div className="grid grid-cols-[70fr_30fr] gap-x-5 py-12">
      <span className="h-120 w-full rounded-lg bg-green-600" />
      <div className="flex flex-col gap-5">
        <span className="h-full w-full rounded-lg bg-red-600" />
        <span className="h-full w-full rounded-lg bg-blue-600" />
      </div>
    </div>
  );
}
