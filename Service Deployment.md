# 서비스 배포 가이드라인

상황에 따라 **소스 직접 빌드 방식(Git Pull)** 또는 **컨테이너 이미지 배포 방식(Docker)** 중 선택하여 배포를 진행한다.

---

# 1. 소스 코드 직접 빌드 방식 (Standard Git Pull)

서버에서 최신 소스를 내려받아 **직접 빌드 후 실행하는 방식**이다.
테스트 서버 또는 단일 서버 환경에서 사용한다.

## 배포 프로세스

### 1. 기존 프로세스 종료

실행 중인 애플리케이션 PID 확인 후 종료한다.

```bash
ps -ef | grep [프로세스 이름]
kill -15 [PID]
```

※ `kill -9` 는 **최후의 수단으로만 사용**

---

### 2. 최신 소스 반영

```bash
git pull origin main
```

필요 시 브랜치 확인

```bash
git branch
```

---

### 3. 빌드

Spring Boot 기준

```bash
mvn clean package -DskipTests
```

---

### 4. 애플리케이션 실행

```bash
nohup java -jar ./target/backend-api.war > app.log 2>&1 &
```

로그 확인

```bash
tail -f app.log
```

---

# 2. Docker 이미지 배포 방식 (Docker Push & Pull)

로컬에서 빌드한 이미지를 **Registry를 통해 서버에 배포하는 방식**

운영 환경에서는 **Docker 방식 사용을 권장**

장점

* 서버 빌드 환경 의존성 제거
* 동일한 실행 환경 보장
* 롤백 용이

---

## A. 이미지 생성 및 업로드 (개발자 PC)

### 1. Registry 로그인

```bash
docker login registry-gitlab.00000.co.kr
```

---

### 2. 이미지 빌드 및 Push

Mac(M1/M2)의 경우 **amd64 플랫폼 빌드 필요**

```bash
docker buildx build \
--platform linux/amd64 \
--push \
--tag registry-gitlab.00000.co.kr/1231231/backendserver:1.0.3.1 \
.
```

---

## B. 서버 배포

### 1. docker-compose.yml 이미지 버전 변경

```yaml
services:
  sd-backend:
    image: registry-gitlab.00000.co.kr/1231231/backendserver:1.0.3.1
```

---

### 2. 최신 이미지 Pull

```bash
docker compose pull
```

---

### 3. 컨테이너 재시작

```bash
docker compose up -d
```

---

# 3. 버전 관리 규칙 (Versioning)

버전 번호는 **X.Y.A.B (4자리)** 형식을 사용한다.

| 구분            | 자리수   | 변경 기준               | 예시      |
| ------------- | ----- | ------------------- | ------- |
| Major / Minor | 1~2번째 | 아키텍처 변경 또는 대규모 업데이트 | 1.0.x.x |
| Feature       | 3번째   | 기능 추가, DB 스키마 변경    | 1.0.4.0 |
| Patch         | 4번째   | 버그 수정, UI 수정        | 1.0.3.2 |

예시

```
1.0.3.2
```

* Major : 1
* Minor : 0
* Feature : 3
* Patch : 2
