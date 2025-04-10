'use client';
import { useParams } from 'next/navigation';

export default function PriorityPage() {
  const { receptionId } = useParams();

  return (
    <div>
      <h1>レコメンド結果（reception_id: {receptionId}）</h1>
      {/* 結果表示ロジック */}
    </div>
  );
}