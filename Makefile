backend_dev:
	cd backend && go build main.go && ./main

setup:
	cd frontend && npm i

frontend_dev:
	cd frontend && npm run dev

frontend_build:
	cd frontend && npm run build
