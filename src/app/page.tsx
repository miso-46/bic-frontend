"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAppliance, setSelectedAppliance] = useState<string>("");
  const [message, setMessage] = useState("どげんしたと〜？");
  const [videoError, setVideoError] = useState(false);
  const [talking, setTalking] = useState(false); // アニメーション用

  const appliances = ["ロボット掃除機", "ドライヤー", "テレビ"];
  const bic_girl = "bic-girl.png";

  // 動画の読み込みエラー処理
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("error", handleError);
    };
  }, []);

  // 動画の自動再生
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch((err) => {
      console.log("自動再生できませんでした:", err);
    });
  }, []);

  // メッセージを順番に変更して音声を再生
  useEffect(() => {
    const messages = [
      { text: "どげんしたと〜？", audio: "/sounds/dogen.mp3" },
      {
        text: "おススメの家電を一緒に検討しましょう！",
        audio: "/sounds/osusume.mp3",
      },
      {
        text: "あなたにぴったりの家電を見つけますよ！",
        audio: "/sounds/pittari.mp3",
      },
      { text: "家電選びで困っとーと？", audio: "/sounds/komattoto.mp3" },
    ];

    let currentIndex = 0;

    const intervalId = setInterval(() => {
      const current = messages[currentIndex];
      setMessage(current.text);

      // 音声再生
      const audio = new Audio(current.audio);
      audio.play().catch((err) => {
        console.log("音声の再生に失敗しました:", err);
      });

      // キャラクターがしゃべってる風アニメーション
      setTalking(true);
      setTimeout(() => setTalking(false), 1500);

      currentIndex = (currentIndex + 1) % messages.length;
    }, 7000);

    return () => clearInterval(intervalId);
  }, []);

  // 家電が選択されたときのメッセージ変更
  useEffect(() => {
    if (selectedAppliance) {
      setMessage(`${selectedAppliance}ですね！いい選択です！`);
    }
  }, [selectedAppliance]);

  const handleApplianceSelect = (appliance: string) => {
    setSelectedAppliance(appliance);
    setIsDropdownOpen(false);
  };

  const handleGoButtonClick = () => {
    if (selectedAppliance) {
      router.push("/question/user");
    }
  };

  const handleAdminButtonClick = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-auto">
      <main className="flex flex-col md:flex-row gap-4 flex-grow">
        {/* 左側のキャラクター部分 */}
        <div className="w-full md:w-1/2 p-4 relative">
          <div className="bg-pink-200 rounded-3xl p-3 mb-4 max-w-[600px] relative">
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-pink-200 rotate-45"></div>
            <p className="text-lg transition-opacity duration-300">{message}</p>
          </div>

          <div className="relative flex justify-center">
            {videoError ? (
              <img
                src={bic_girl}
                alt="キャラクター"
                className={`w-[300px] h-[500px] object-contain ${
                  talking ? "talking" : ""
                }`}
              />
            ) : (
              <video
                ref={videoRef}
                className={`w-[300px] h-[500px] object-contain ${
                  talking ? "talking" : ""
                }`}
                muted
                loop
                playsInline
                controls={false}
              >
                <source src="/images/bic-girl.mov" type="video/quicktime" />
                <source src="/images/bic-girl.mp4" type="video/mp4" />
                お使いのブラウザは動画再生に対応していません。
              </video>
            )}
          </div>
        </div>

        {/* 右側の診断部分 */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="p-4 flex justify-center">
            <Image
              src="/images/title.png"
              alt="ビッカメ娘ロゴ"
              width={300}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="p-4">
            <h2 className="text-[42px] font-bold text-center">
              おススメ家電診断
            </h2>
          </div>

          <div className="p-4">
            <div className="relative">
              <button
                className="w-full text-left flex justify-between items-center text-2xl font-bold py-8 px-6 border rounded-md h-32"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="flex-1 text-center">
                  {selectedAppliance
                    ? `【${selectedAppliance}】`
                    : "【家電を選ぶ】"}
                </span>
                <ChevronDown
                  className="transition-transform duration-200 w-8 h-8"
                  style={{
                    transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                  {appliances.map((appliance) => (
                    <div
                      key={appliance}
                      className="cursor-pointer p-4 text-2xl hover:bg-gray-100 border-b last:border-b-0"
                      onClick={() => handleApplianceSelect(appliance)}
                    >
                      {appliance}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* フッター部分 */}
      <footer className="flex justify-between items-center p-4 mt-4">
        <button
          className="border border-pink-500 text-pink-500 rounded-full px-6 py-2"
          onClick={handleAdminButtonClick}
        >
          管理者メニューへ
        </button>
        <button
          className={`bg-red-500 text-white text-2xl font-bold py-3 px-24 rounded-full mr-16 ${
            !selectedAppliance ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!selectedAppliance}
          onClick={handleGoButtonClick}
        >
          GO!
        </button>
      </footer>
    </div>
  );
}
