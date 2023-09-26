FROM postgres:16-alpine

EXPOSE 5432

# # Import the PostgreSQL repository key
# RUN apt update && apt install -y \
#     curl \
#     gnupg2 \
#     ca-certificates \
# 	 &&\
#     rm -rf /var/lib/apt/lists/*

# RUN curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
# # Add the PostgreSQL repository
# RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main" > /etc/apt/sources.list.d/pgdg.list
# # Install PostgreSQL and PostgreSQL client
# RUN apt update && apt install -y \
#     postgresql-12 &&\
#     rm -rf /var/lib/apt/lists/*

# # Allow connections to PostgreSQL
# RUN echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/12/main/pg_hba.conf
# RUN echo "listen_addresses='*'" >> /etc/postgresql/12/main/postgresql.conf

# EXPOSE 5432

# COPY ./conf/postgres_init.sh /postgres_init.sh
# RUN chmod +x /postgres_init.sh

# CMD ["/postgres_init.sh"]
