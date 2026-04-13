from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ScoreWeights:
    mentor: float = 0.40
    client: float = 0.30
    peer: float = 0.20
    artifact: float = 0.10


def compute_success_rate(
    mentor_score: float | None,
    client_score: float | None,
    peer_score: float | None,
    artifact_score: float | None,
    weights: ScoreWeights = ScoreWeights(),
) -> float | None:
    parts = []
    if mentor_score is not None:
        parts.append((mentor_score, weights.mentor))
    if client_score is not None:
        parts.append((client_score, weights.client))
    if peer_score is not None:
        parts.append((peer_score, weights.peer))
    if artifact_score is not None:
        parts.append((artifact_score, weights.artifact))

    if not parts:
        return None

    total_weight = sum(w for _, w in parts)
    if total_weight <= 0:
        return None

    weighted = sum(score * w for score, w in parts)
    return weighted / total_weight

