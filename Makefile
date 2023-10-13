
all:
	docker compose up --build

clean:
	docker compose down --rmi all

fclean: clean
	docker builder prune

re: fclean all

down:
	docker compose down

.PHONY:
	all clean fclean re down postgres api frontend adminer
