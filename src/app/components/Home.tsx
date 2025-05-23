"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { openDB } from "idb";
import { M_PLUS_Rounded_1c } from "next/font/google";

const mplusRounded = M_PLUS_Rounded_1c({
  weight: "700",
  subsets: ["latin"],
});

const getMediaDB = async () => {
  return await openDB("bicAppDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media");
      }
    },
  });
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // for hamburger
  const [isApplianceDropdownOpen, setIsApplianceDropdownOpen] = useState(false); // for appliance
  const [selectedAppliance, setSelectedAppliance] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [videoError, setVideoError] = useState(false);
  const [talking, setTalking] = useState(false); // アニメーション用
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fallbackVideo, setFallbackVideo] = useState(false);
  const [girlName, setGirlName] = useState<string | null>(null);
  const [storeReady, setStoreReady] = useState(false);
  const [storeAvailable, setStoreAvailable] = useState(true);

  const fetchStoreData = async (storeId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/${storeId}`);
      if (!res.ok) throw new Error("APIリクエスト失敗");

      const data = await res.json();

      localStorage.setItem("store_id", data.store_id.toString());
      localStorage.setItem("store_name", data.store_name);
      localStorage.setItem("store_prefecture", data.prefecture);

      const db = await openDB("bicAppDB", 1, {
        upgrade(db) {
          if (db.objectStoreNames.contains("media")) {
            db.deleteObjectStore("media");
          }
          db.createObjectStore("media");
        },
      });

      const fetchAndStoreBlob = async (key: string, url: string | null) => {
        if (!url) return;
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          await db.put("media", blob, key);
        } catch (err) {
          console.error(`${key} の取得に失敗しました`, err);
        }
      };

      await fetchAndStoreBlob("girl_name", data.character.image);
      await fetchAndStoreBlob("image", data.character.image);
      await fetchAndStoreBlob("video", data.character.video);
      await fetchAndStoreBlob("voice_1", data.character.voice_1);
      await fetchAndStoreBlob("voice_2", data.character.voice_2);
      await db.put("media", data.character.message_1 || "", "voice_1_message");
      await db.put("media", data.character.message_2 || "", "voice_2_message");
      await db.put("media", data.character.name || "", "girl_name");

      setGirlName(data.character.name); // useStateにセット
      setStoreAvailable(true);
    } catch (err) {
      console.error("保存中のエラー:", err);
      setStoreAvailable(false);
    } finally {
      setStoreReady(true);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const storeId = searchParams.get("store_id") || (typeof window !== "undefined" && localStorage.getItem("store_id"));
 
      if (!storeId) {
        setStoreAvailable(false);
        setStoreReady(true);
        return;
      }
 
      const db = await getMediaDB();

      const girlNameCache = await db.get("media", "girl_name");
      if (typeof girlNameCache === "string") {
        setGirlName(girlNameCache);
      }
 
      const [image, video, voice1, voice2, message1, message2] = await Promise.all([
        db.get("media", "image"),
        db.get("media", "video"),
        db.get("media", "voice_1"),
        db.get("media", "voice_2"),
        db.get("media", "voice_1_message"),
        db.get("media", "voice_2_message"),
      ]);
 
      const hasAllMedia = image && video && voice1 && voice2 && typeof message1 === "string" && typeof message2 === "string";
 
      if (hasAllMedia) {
        setStoreReady(true);
        sessionStorage.setItem("assetsReady", "true");
      }
 
      // バックグラウンドでの更新
      fetchStoreData(storeId);
    };
 
    initialize();
  }, [searchParams]);

  useEffect(() => {
    if (!storeReady) return;

    const video = videoRef.current;
    if (!video) return;

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener("error", handleError);
    return () => {
      video.removeEventListener("error", handleError);
    };
  }, [storeReady]);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const db = await getMediaDB();
        const blob = await db.get("media", "video");

        let src: string;
        if (blob instanceof Blob && blob.size > 0) {
          src = URL.createObjectURL(blob);
          setVideoSrc(src);
          setFallbackVideo(false);
        } else {
          src = "/images/bic-girl.mp4";
          setVideoSrc(src);
          setFallbackVideo(true);
        }

        setTimeout(() => {
          const video = videoRef.current;
          if (video) {
            video.muted = true;
            video.play().catch((err) => {
              console.warn("動画の再生に失敗しました:", err);
              setVideoError(true);
            });
          }
        }, 100);
      } catch (error) {
        console.error("動画の取得に失敗しました", error);
        setVideoSrc("/images/bic-girl.mp4");
        setFallbackVideo(true);
        setVideoError(true);
      }
    };

    if (storeReady) loadVideo();
  }, [storeReady]);

  useEffect(() => {
    if (!storeReady) return;

    const messages = [
      { key: "voice_1", fallbackAudio: "/sounds/osusume.mp3", fallbackText: "おススメの家電を一緒に検討しましょう！", messageKey: "voice_1_message" },
      { key: "voice_2", fallbackAudio: "/sounds/pittari.mp3", fallbackText: "あなたにぴったりの家電を見つけますよ！", messageKey: "voice_2_message" },
    ];

    let currentIndex = 0;
    const audio = new Audio();

    const playNext = async () => {
      const current = messages[currentIndex];
      try {
        const db = await getMediaDB();
        const blob = await db.get("media", current.key);

        if (blob) {
          audio.src = URL.createObjectURL(blob);
          const text = await db.get("media", current.messageKey);
          setMessage(typeof text === "string" ? text : current.fallbackText);
        } else {
          audio.src = current.fallbackAudio;
          setMessage(current.fallbackText);
        }

        await audio.play();
      } catch (err: unknown) {
        console.error("音声再生エラー:", err);
      }

      setTalking(true);
      setTimeout(() => setTalking(false), 1500);
      currentIndex = (currentIndex + 1) % messages.length;
    };

    playNext();
    const intervalId = setInterval(playNext, 5000);

    return () => {
      clearInterval(intervalId);
      audio.pause();
    };
  }, [storeReady]);

  useEffect(() => {
    if (selectedAppliance) {
      setMessage(`${selectedAppliance}ですね！いい選択です！`);
    }
  }, [selectedAppliance]);

  const handleApplianceSelect = (appliance: string) => {
    setSelectedAppliance(appliance);
    setIsApplianceDropdownOpen(false);
  };

  const handleGoButtonClick = () => {
    if (selectedAppliance) {
      const categoryId = appliances[selectedAppliance];
      localStorage.setItem("category_id", categoryId.toString());
      localStorage.setItem("category_name", selectedAppliance);
      router.push(`/chat/${categoryId}`);
    }
  };

  const handleAdminButtonClick = () => {
    router.push("/login");
  };

  if (!storeReady) {
    return <div className="flex items-center justify-center h-screen">読み込み中...</div>;
  }

  if (!storeAvailable) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button
          className="bg-red-500 text-white text-3xl font-bold py-4 px-12 rounded-full"
          onClick={() => router.push("/login")}
        >
          管理者メニューへ
        </button>
      </div>
    );
  }

  const appliances: { [key: string]: number } = {
    "ロボット掃除機": 1000,
    "ドライヤー（※開発中）": 1000,
    "テレビ（※開発中）": 1000,
  };
  const bic_girl = "/images/girl.png";

  return (
    <div className="flex flex-col h-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between text-white p-4">
        <div className="relative">
          <button
            className="p-2 focus:outline-none text-gray-700"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <svg
              className="w-8 h-8 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {isMenuOpen && (
            <div
              className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10"
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <button
                onClick={handleAdminButtonClick}
                className="block px-4 py-2 text-left w-full text-gray-700 hover:bg-gray-100"
              >
                管理者メニュー
              </button>
            </div>
          )}
        </div>
      </div>
      <main className="flex flex-col md:flex-row gap-4 flex-grow">
        {/* 左側のキャラクター部分 */}
        <div className="w-full md:w-1/2 p-4 relative">
          <div className="flex justify-center">
            <div className="bg-[#FFE8E8] rounded-2xl p-3 mb-4 max-w-[400px] relative text-center">
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#FFE8E8] rotate-45"></div>
              <p className="text-md transition-opacity duration-300">{message}</p>
            </div>
          </div>

          <div className="relative flex justify-center">
            {videoError ? (
              <Image
                src={bic_girl}
                alt="キャラクター"
                width={300}
                height={500}
                className={`object-contain ${talking ? "talking" : ""}`}
              />
            ) : videoSrc ? (
              fallbackVideo ? (
                <video
                  ref={videoRef}
                  className={`w-[300px] h-[500px] md:h-[500px] sm:h-[400px] h-[300px] object-contain ${talking ? "talking" : ""}`}
                  muted
                  loop
                  playsInline
                  controls={false}
                >
                  <source src={videoSrc} type="video/mp4" />
                  お使いのブラウザは動画再生に対応していません。
                </video>
              ) : (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className={`w-[300px] h-[500px] md:h-[500px] sm:h-[400px] h-[300px] object-contain ${talking ? "talking" : ""}`}
                  muted
                  loop
                  playsInline
                  controls={false}
                />
              )
            ) : (
              <Image
                src={bic_girl}
                alt="キャラクター"
                width={300}
                height={500}
                className={`object-contain ${talking ? "talking" : ""}`}
              />
            )}
          </div>
          {girlName && (
            <p className="text-xl text-center mt-2">{girlName}</p>
          )}
        </div>

        {/* 右側の診断部分 */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="p-4 flex justify-center">
            <Image
              src="/images/title.png"
              alt="アプリ名ロゴ"
              width={300}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="p-4">
            <h2 className={`text-[35px] md:text-[42px] sm:text-[32px] text-[24px] font-bold text-center ${mplusRounded.className}`}>
              おススメ家電診断
            </h2>
          </div>

          <div className="p-4">
            <div className="relative">
              <button
                className="w-full text-left flex justify-between items-center text-2xl font-bold py-8 px-6 border rounded-md h-32"
                onClick={() => setIsApplianceDropdownOpen(!isApplianceDropdownOpen)}
              >
                <span className="flex-1 text-center">
                  {selectedAppliance
                    ? `【${selectedAppliance}】`
                    : "【家電を選ぶ】"}
                </span>
                <ChevronDown
                  className="transition-transform duration-200 w-8 h-8"
                  style={{
                    transform: isApplianceDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                />
              </button>

              {isApplianceDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                  {Object.entries(appliances).map(([name]) => (
                    <div
                      key={name}
                      className="cursor-pointer p-4 text-2xl hover:bg-gray-100 border-b last:border-b-0"
                      onClick={() => handleApplianceSelect(name)}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <footer className="flex justify-center p-4">
            <button
              className={`bg-red-500 text-white text-2xl font-bold py-3 px-24 rounded-full ${mplusRounded.className} ${
                !selectedAppliance ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!selectedAppliance}
              onClick={handleGoButtonClick}
            >
              GO!
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}
