FROM debian:buster

# Import the PostgreSQL repository key
RUN apt update && apt install -y \
    curl \
    gnupg2 \
    ca-certificates &&\
    rm -rf /var/lib/apt/lists/*

RUN curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
# Add the PostgreSQL repository
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main" > /etc/apt/sources.list.d/pgdg.list
# Install PostgreSQL and PostgreSQL client
RUN apt update && apt install -y \
    postgresql-12 &&\
    rm -rf /var/lib/apt/lists/*

# Configure PostgreSQL
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "ALTER USER postgres WITH PASSWORD 'password';" && \
    psql --command "CREATE DATABASE db;" && \
    /etc/init.d/postgresql stop

# Allow connections to PostgreSQL
RUN echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/12/main/pg_hba.conf
RUN echo "listen_addresses='*'" >> /etc/postgresql/12/main/postgresql.conf

EXPOSE 5432

CMD ["/usr/lib/postgresql/12/bin/postgres", "-D", "/var/lib/postgresql/12/main", "-c", "config_file=/etc/postgresql/12/main/postgresql.conf"]
