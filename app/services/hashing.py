from __future__ import annotations

import hashlib

from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def sha256_hex(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()
