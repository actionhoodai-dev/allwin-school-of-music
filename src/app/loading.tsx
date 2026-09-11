import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-900 select-none">
      <div className="relative w-20 h-20 mb-4 animate-pulse">
        <Image
          src="/logo.png"
          alt="Allwin School of Music"
          fill
          sizes="80px"
          className="object-contain rounded-full shadow-md ring-4 ring-blue-100"
          priority
        />
      </div>
      <div className="w-6 h-6 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
