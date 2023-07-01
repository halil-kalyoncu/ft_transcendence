
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
	sudo docker compose up postgres --build

api:
	sudo docker compose up api --build

frontend:
	sudo docker compose up frontend --build

adminer:
	sudo docker compose up adminer --build

.PHONY:
	all clean fclean re down postgres api frontend adminer
