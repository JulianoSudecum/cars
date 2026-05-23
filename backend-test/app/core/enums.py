"""Enumerações de domínio compartilhadas (usadas por models e schemas)."""

from enum import StrEnum


class Combustivel(StrEnum):
    GASOLINA = "GASOLINA"
    ETANOL = "ETANOL"
    FLEX = "FLEX"
    DIESEL = "DIESEL"
    GNV = "GNV"
    ELETRICO = "ELETRICO"
    HIBRIDO = "HIBRIDO"
