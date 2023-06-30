
all:
	sudo docker compose up --build

clean:
	sudo docker compose down --rmi all

fclean: clean
	sudo docker builder prune

re: fclean all

down:
	sudo docker compose down

postgres:
	sudo docker compose up postgres

api:
	sudo docker compose up api

frontend:
	sudo docker compose up frontend

adminer:
	sudo docker compose up adminer

.PHONY:
	all clean fclean re down postgres api frontend adminer
