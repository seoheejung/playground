# [서비스 배포 가이드라인]

> 상황에 따라 소스 직접 빌드(Git) 방식과 이미지 배포(Docker) 방식 중 선택하여 진행

---
## 🚀 1. 소스 코드 직접 빌드 방식 (Standard Git Pull)
* 서버에서 최신 소스를 내려받아 직접 컴파일하고 실행하는 방식

### [배포 프로세스]
1. 기존 프로세스 종료
   - 실행 중인 애플리케이션의 PID를 확인하고 종료
	```
	ps -ef | grep [프로세스 이름]  # PID 확인
	kill -9 [확인된 PID]          # 프로세스 강제 종료
	```
2. 최신 소스 반영
   - 원격 저장소로부터 최신 코드를 가져오기
	```
	git pull [원격저장소 주소]
	```
3. 빌드 및 실행 (Java/Spring 기준)
   - Maven을 사용하여 패키징 후 백그라운드에서 실행
	```
	mvn clean package
	nohup java -jar ./target/123123131-API-0.0.1-SNAPSHOT.war &
	```
---
## 🚀 도커 이미지 빌드 방식 (Docker Push & Pull)
* 로컬에서 빌드된 이미지를 저장소(Registry)를 통해 서버에 배포하는 권장 방식
* 서버에서 오류가 났을 시 이전 버전으로 빨리 복구 가능

### [배포 프로세스]
#### A. 이미지 생성 및 업로드 (작업자 PC)
1. 이미지 저장소 로그인
	```
	docker login registry-gitlab.00000.co.kr
	```
2. 멀티 플랫폼 빌드 및 푸시
   - 맥(M1/M2) 사용자는 서버 환경(amd64)에 맞게 빌드
   - 주의: 실행 전 .env.prod 설정값이 올바른지 반드시 확인
   ```
   docker buildx build --platform linux/amd64 \
   --push --tag registry-gitlab.00000.co.kr/1231231/backendserver:1.0.3.1 .
   ```

#### B. 서버 적용 (운영 서버)
1. 설정 파일(docker-compose.yml) 업데이트
   - 사용할 이미지의 태그(버전) 수정
   ```
   services:
     sd-backend:
       image: registry-gitlab.00000.co.kr/1231231/backendserver:1.0.3.1
   ```
2. 컨테이너 재실행
	```
	docker-compose up -d  # 수정된 이미지를 감지하여 컨테이너 재시작
	```

---
### 버전 관리 규칙 (Versioning)
- 버전 번호: X.Y.A.B 4자리 형식 사용

| 구분 | 자리수 | 변경 기준 | 예시
| ---- |----| ---- |---- |
| Major/Minor | 1~2번째 | 아키텍처 변경 또는 대규모 업데이트 | 1.0.x.x
| Feature | 3번째 | "주요 기능 추가, DB 테이블 변경 등" | 1.0.4.0
| Patch | 4번째 | "단순 UI 수정, 오타, 긴급 버그 수정" | 1.0.3.2
