FROM mcr.microsoft.com/devcontainers/dotnet:dev-10.0-noble

RUN rm -f /etc/apt/sources.list.d/yarn* \
    && apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends sqlite3 libsqlite3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
