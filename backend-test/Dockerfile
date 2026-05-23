FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Instala o pacote (modo editável → uma única cópia de "app" no path).
COPY pyproject.toml ./
COPY app ./app
RUN pip install -e .

# Demais artefatos de runtime.
COPY alembic ./alembic
COPY alembic.ini ./
COPY scripts ./scripts

# Garante line endings LF no entrypoint (caso o build venha de um host Windows).
RUN sed -i 's/\r$//' scripts/entrypoint.sh

# Usuário não-root.
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
ENTRYPOINT ["bash", "scripts/entrypoint.sh"]
