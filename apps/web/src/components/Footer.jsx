export default function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-gray-100 bg-white/50 py-6 text-center backdrop-blur-md">
      <div className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-6">
        <a href="/privacy" className="text-sm text-gray-500 transition-colors hover:text-blue-600 font-medium">سياسة الخصوصية</a>
        <a href="/terms" className="text-sm text-gray-500 transition-colors hover:text-blue-600 font-medium">شروط الاستخدام</a>
        <a href="/contact" className="text-sm text-gray-500 transition-colors hover:text-blue-600 font-medium">اتصل بنا</a>
      </div>
      <p className="mt-4 text-xs text-gray-400 font-light">
        © {new Date().getFullYear()} منصة المصالحة. تم التصميم للترفيه وإسعاد من نحب.
      </p>
    </footer>
  );
}
