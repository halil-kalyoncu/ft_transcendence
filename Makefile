
all:
	docker compose up --build

clean:
	docker compose down --rmi all

fclean: clean
	docker builder prune

re: fclean all

down:
	docker compose down

postgres:
	docker compose up postgres --build

api:
	docker compose up api --build

frontend:
	docker compose up frontend --build

adminer:
	docker compose up adminer --build

.PHONY:
	all clean fclean re down postgres api frontend adminer
