# [서비스 배포 방법]

1. 서버에서 소스 코드를 받아서 빌드 하는 방법 
2. 모든 도커 설정이 들어간 이미지를 다운 받아서 빌드

---
### 🚀 소스 코드 적용 방법
* 설명
	* 깃에 소스를 push하고 미리 생성한 도커 서버에서 pull 받아서 서버에 적용하는 방식
* 도커 서버에서 깃 소스 적용하는 명령어
	1. ps -eaf | grep [프로세스 이름]
		- 해당 실행 중인 프로세스 번호 찾기
	2. kill -9 [프로세스 번호]
		- 해당 프로세스 죽이기
	3. git pull 주소
		- 깃 소스 받아오기
	4. 서버 적용
		```
		[자바인 경우]
		mvn package
		java -jar ./target/Shinhanlife-API-0.0.1-SNAPSHOT.war & 
		```
---
### 🚀 도커 이미지 빌드 방법
* 설명
	* 작업자 컴퓨터에서 도커 이미지 생성 후 도커 이미지만 저장하는 서버로 전송하여 적용하는 방식 
* 장점
	* 서버에서 오류가 났을 시 이전 버전으로 빨리 복구 가능
* 도커 이미지를 만들자마자 우리 서버로 올리는 명령어
	1. docker login registry-gitlab.anypot.co.kr 
		- 우리 회사만 쓰는 도커허브에 로그인
	2. docker buildx build --platform linux/amd64 --push --tag registry-gitlab.anypot.co.kr/aispot/backendserver:1.0.3.1 .
		- 도커 upload (env 파일 체크! env.prod 내용 복붙)
		- buildx << 맥에서 빌드 시 중요!
	3. docker-compose.yml 파일 변경 작업
		```
		services:
		sd-backend:
			image: registry-gitlab.anypot.co.kr/aispot/backendserver:1.0.3.1
		```
	4. docker-compose up -d
		- docker-compose.yml 파일 실행


* 버전 표기 방법 (예시)
	* 4자리. 많이 바뀐 경우 3번째 자리 +1, 적게 바뀐 경우 4번째 자리 +1