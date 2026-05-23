"""Hashing de senha (pwdlib/bcrypt) e emissão/validação de tokens JWT (PyJWT)."""

import base64
import hashlib
from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

from app.core.config import settings

# Usa bcrypt explicitamente (casa com a extra pwdlib[bcrypt] e evita o
# warning conhecido do passlib).
_password_hash = PasswordHash((BcryptHasher(),))


def _prehash(password: str) -> str:
    """Pré-hash SHA-256 (base64) aplicado antes do bcrypt.

    Remove o limite de 72 bytes do bcrypt (que levanta ValueError para senhas
    maiores), aceitando senhas de qualquer tamanho/encoding. O resultado base64
    tem 44 bytes ASCII e não contém null bytes.
    """
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest).decode("ascii")


def hash_password(password: str) -> str:
    return _password_hash.hash(_prehash(password))


def verify_password(password: str, hashed_password: str) -> bool:
    return _password_hash.verify(_prehash(password), hashed_password)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """Decodifica e valida o token. Levanta jwt.PyJWTError se inválido/expirado."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
