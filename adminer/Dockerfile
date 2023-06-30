FROM debian:buster

RUN apt update && apt install -y \
	curl \
	php7.3 \
	php7.3-mysql \
	php7.3-pgsql \
	php7.3-sqlite3 \
	php7.3-odbc \
	php7.3-mbstring \
	php7.3-xml &&\
	rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Download Adminer
RUN curl -fsSL https://www.adminer.org/latest.php -o index.php

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80"]