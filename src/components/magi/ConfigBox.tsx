"use client";

import { useEffect, useState } from "react";
import type { MagiFinalResult } from "./index";

type Props = {
  result: MagiFinalResult;
  isCompleted: boolean;
};

// 共通のスタイル（Code以外の項目）
const itemClassName = "text-base leading-relaxed scale-y-[1.4]";

export const ConfigBox = ({ result, isCompleted }: Props) => {
  const [code, setCode] = useState(Math.floor(Math.random() * 900) + 100);

  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      setCode(Math.floor(Math.random() * 900) + 100);
    }, 500);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // 結果に応じたコード表示（HTTPステータスコード風）
  const getResultCode = () => {
    if (!isCompleted) return code.toString();
    if (result === "AGREE") return "200";
    return "403";
  };

  // 結果に応じた色クラス
  const getCodeColorClass = () => {
    if (!isCompleted) return "text-[#f4b000]";
    if (result === "AGREE") return "text-[#50ff10]";
    return "text-[#c80010]";
  };

  return (
    <div className="hidden md:block uppercase text-left py-4 text-[#f06800] font-light font-['Helvetica_Neue',Helvetica,sans-serif]">
      {/* Code: 大きく表示 */}
      <div className="font-semibold text-3xl scale-x-[0.6] origin-left">
        Code: <span className={getCodeColorClass()}>{getResultCode()}</span>
      </div>
      {/* 他の項目 */}
      <div className={itemClassName}>
        File: <span className="font-bold">MAGI_SYS</span>
      </div>
      <div className={itemClassName}>
        Volume: <span className="font-bold">66%</span>
      </div>
      <div className={itemClassName}>
        EX_MODE: <span className="font-bold">ON</span>
      </div>
      <div className={itemClassName}>
        Priority: <span className="font-bold">AAA</span>
      </div>
      <div className={itemClassName}>
        Sound: <span className="font-bold">ON</span>
      </div>
    </div>
  );
};
