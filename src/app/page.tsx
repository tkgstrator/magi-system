import { COLORS, MagiQueryInput } from "@/components/magi";

const HomePage = () => {
  return (
    <div
      className="min-h-screen bg-black font-mono select-none"
      style={{ color: COLORS.primary }}
    >
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* タイトル */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-matisse tracking-widest">
            MAGI
          </h1>
          <p className="mt-2 text-xs md:text-sm tracking-[0.5em]">SYSTEM</p>
        </div>

        {/* 3つのユニット表示 */}
        <div className="mb-8 md:mb-12 flex flex-wrap justify-center gap-4 md:gap-8 text-xs tracking-wider">
          <span>MELCHIOR-1</span>
          <span>BALTHASAR-2</span>
          <span>CASPER-3</span>
        </div>

        {/* 質問入力フォーム */}
        <MagiQueryInput />

        {/* フッター */}
        <div className="mt-auto pt-12 text-xs opacity-50">
          NERV HEADQUARTERS
        </div>
      </main>
    </div>
  );
};

export default HomePage;
