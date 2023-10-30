backend_dev:
	cd backend && go build && ./backend

setup:
	cd frontend && npm i

frontend_dev:
	cd frontend && npm run dev

frontend_build:
	cd frontend && npm run build
