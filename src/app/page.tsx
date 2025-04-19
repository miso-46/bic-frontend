"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { openDB } from "idb";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

      localStorage.setItem("girl_name", data.character.name);
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

      await fetchAndStoreBlob("image", data.character.image);
      await fetchAndStoreBlob("video", data.character.video);
      await fetchAndStoreBlob("voice_1", data.character.voice_1);
      await fetchAndStoreBlob("voice_2", data.character.voice_2);
      await db.put("media", data.character.message_1 || "", "voice_1_message");
      await db.put("media", data.character.message_2 || "", "voice_2_message");

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
      let storeId = searchParams.get("store_id");

      if (!storeId && typeof window !== "undefined") {
        storeId = localStorage.getItem("store_id");
      }

      if (!storeId) {
        setStoreAvailable(false);
        setStoreReady(true);
        return;
      }

      await fetchStoreData(storeId);
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
    setIsDropdownOpen(false);
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
    "ドライヤー": 1000,
    "テレビ": 1000,
  };
  const bic_girl = "/images/girl.png";

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
                  className={`w-[300px] h-[500px] object-contain ${talking ? "talking" : ""}`}
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
                  className={`w-[300px] h-[500px] object-contain ${talking ? "talking" : ""}`}
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
