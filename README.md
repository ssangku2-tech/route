# My Route — 설치 가이드 (URI 방식)

집(은빛마을 612동) ↔ 목적지 실시간 대중교통 소요시간 앱.
경로(ODsay)는 브라우저에서 직접 호출(URI 키), 목적지 검색(Kakao)만 Worker 프록시 경유.

## 구성 파일
- `index.html` — 앱 본체
- `worker.js` — Kakao 검색 프록시 (목적지 추가 검색 쓸 때만 필요)
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — PWA 자산

---

## 1단계 — ODsay URI 키 발급 (필수, 무료)
1. https://lab.odsay.com 가입 → 내 애플리케이션 → 애플리케이션 등록
2. 서비스 유형: **무료(Basic)** / 사용자 유형: **개인**
3. **서비스 플랫폼 환경: "URI" 선택** ← 중요
   - "서버"는 공인 IP를 요구하므로 쓰지 않음
   - "URI" 입력란에 본인 GitHub Pages 주소 입력:
     `https://ssangku2-tech.github.io`
4. 등록 후 발급된 **URI 키** 복사
5. `index.html` 상단:
   ```js
   const ODSAY_KEY = "여기에_URI_키";
   ```

> URI 방식은 등록한 도메인에서 온 호출만 허용합니다. 키가 브라우저에
> 보이더라도 다른 도메인에서는 호출이 막히므로 개인용으로는 충분합니다.

## 2단계 — (선택) 목적지 검색용 Kakao 프록시
목적지 추가 검색을 쓸 경우에만 필요합니다. 안 쓰면 건너뛰세요.
1. https://developers.kakao.com → 앱 만들기 → **REST API 키** 복사
2. https://dash.cloudflare.com → Workers & Pages → Create → Worker (이름 `route-search`)
3. `worker.js` 내용 붙여넣기 → Deploy
4. Settings → Variables and Secrets: `KAKAO_KEY` = Kakao REST 키 (Secret 권장)
5. 배포 주소를 `index.html` 의 `PROXY` 에 입력
   - `주소/health` 열어 `"kakao":true` 나오면 OK

## 3단계 — GitHub Pages 배포
1. 새 repo `route` 생성 → 파일 전부 업로드 → Settings → Pages → main 브랜치
2. 접속: `https://ssangku2-tech.github.io/route/`
   - ⚠️ ODsay URI에 등록한 도메인과 실제 배포 도메인이 같아야 호출이 됩니다
3. 폰 브라우저에서 열고 "홈 화면에 추가"

---

## 기능
- 기본 목적지 2개(에이스테크노타워5차 / 미사랑데르 III), 각 2개 경로
- 지하철 우선 정렬, 없으면 버스 포함
- 노선 색상 막대 + 역명·소요시간·환승·요금·도보거리
- 출근/퇴근 전환(카드 우측 버튼)
- 조회 시점 기준 실시간(↻ 새로고침)
- 식당·건물·주소로 목적지 추가 검색(Kakao 프록시 설정 시)

## 좌표 (코드 내장)
- 집: 126.8364, 37.6417
- 에이스테크노타워5차: 126.8943, 37.4855
- 미사랑데르 III: 127.1933, 37.5611

## 캐시 갱신
수정 반영 안 되면 `sw.js`의 `VERSION` 값을 올리고 재배포.

## 문제 해결
- 경로가 "조회 실패" → ODsay URI에 등록한 도메인과 접속 도메인 일치 확인, 키 오타, Basic 호출 한도 확인
- 검색만 안 됨 → Kakao 프록시(`PROXY`) 주소·`KAKAO_KEY` 확인

## 확장 아이디어
- 추가 목적지 Firebase 동기화 (기존 패턴)
- 막차/첫차 시간 표시 (ODsay 지하철 시간표 API)
- 출발 시각 후보(지금/10분 뒤/30분 뒤) 비교
