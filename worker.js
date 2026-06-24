/**
 * 출퇴근 길찾기 - Kakao 지명검색 프록시 (Cloudflare Worker)
 *
 * 경로(ODsay)는 index.html에서 URI 키로 직접 호출하므로 여기 없음.
 * 이 Worker는 목적지 추가 검색(Kakao)만 중계해 키를 숨깁니다.
 * 목적지 검색이 필요 없으면 이 Worker는 배포하지 않아도 됩니다.
 *
 * 배포 방법
 * 1) https://dash.cloudflare.com → Workers & Pages → Create → Worker
 * 2) 이 파일 내용을 붙여넣고 Deploy
 * 3) Settings → Variables and Secrets:
 *      KAKAO_KEY = 카카오 REST API 키 (https://developers.kakao.com 무료 발급)
 * 4) 배포 주소를 index.html 의 PROXY 값에 입력
 */

const ALLOW = "*"; // 필요 시 본인 GitHub Pages 도메인으로 제한 가능

function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin": ALLOW,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extra,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    try {
      // ---- 지명/장소 키워드 검색 ----
      if (url.pathname === "/search") {
        const q = url.searchParams.get("q");
        if (!q) return json({ documents: [] });
        if (!env.KAKAO_KEY) {
          return json({ error: "KAKAO_KEY 미설정 (Worker 변수 확인)" }, 500);
        }
        const api =
          "https://dapi.kakao.com/v2/local/search/keyword.json" +
          `?query=${encodeURIComponent(q)}&size=8`;
        const r = await fetch(api, {
          headers: { Authorization: `KakaoAK ${env.KAKAO_KEY}` },
        });
        const data = await r.json();
        return json(data);
      }

      // ---- 헬스체크 ----
      if (url.pathname === "/" || url.pathname === "/health") {
        return json({ ok: true, service: "commute-search-proxy", kakao: !!env.KAKAO_KEY });
      }

      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: String(e.message || e) }, 500);
    }
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: cors() });
}
