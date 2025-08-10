# Supabase MCP 연결 설정 가이드

## ✅ 완료된 작업

1. **MCP 서버 설치**: `@supabase/mcp-server-supabase@latest` 설치 완료
2. **설정 파일 생성**: `.claude/mcp.json` 생성 완료
3. **환경 변수 준비**: `.env` 파일에 `SUPABASE_ACCESS_TOKEN` 추가

## 🔧 다음 단계

### 1. Supabase Personal Access Token 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. Settings → Access Tokens 이동
3. "New token" 클릭
4. Name: "Claude Code MCP" 
5. 생성된 토큰을 복사

### 2. 환경 변수 설정

`.env` 파일에서 토큰 설정:
```bash
SUPABASE_ACCESS_TOKEN=sbp_your_actual_token_here
```

### 3. MCP 설정 확인

생성된 파일: `.claude/mcp.json`
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=yyynhebnkwgqyqdfezpo"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

### 4. 보안 권장사항

- ✅ **Read-only 모드**: 데이터베이스 쓰기 방지
- ✅ **프로젝트 스코핑**: 특정 프로젝트만 접근
- ⚠️  **개발 환경 사용**: 프로덕션 데이터 보호

### 5. MCP 사용 예시

MCP 연결 후 다음과 같은 작업이 가능합니다:
- 데이터베이스 스키마 조회
- 테이블 데이터 분석
- SQL 쿼리 실행 (읽기 전용)
- Edge Functions 관리

## 🚀 다음 작업

1. **토큰 생성**: Supabase 대시보드에서 액세스 토큰 생성
2. **환경 변수**: `.env`에 실제 토큰 추가
3. **Claude 재시작**: 새로운 MCP 설정 적용