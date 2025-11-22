import Link from 'next/link';

interface NavButtonProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavButton({ href, children, isActive }: NavButtonProps) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-700 hover:bg-blue-50'
        }`}
    >
      {children}
    </Link>
  );
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          BÁO CÁO CỘNG ĐỒNG
        </h1>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <NavButton href="">
            Gửi báo cáo mới
          </NavButton>
          <NavButton href="">
            Lịch sử báo cáo
          </NavButton>
        </div>
      </div>
      {children}
    </div>
  );
}