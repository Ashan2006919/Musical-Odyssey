export default function TestPage() {
  return (
    <div className="grid grid-cols-6 gap-4">
      <div className="col-span-4 row-span-3 col-start-2 bg-black">01</div>
      <div className="col-start-1 col-end-3 bg-black">02</div>
      <div className="col-span-2 col-end-7 bg-black">03</div>
      <div className="col-start-1 col-end-7 bg-black">04</div>
    </div>
  );
}
