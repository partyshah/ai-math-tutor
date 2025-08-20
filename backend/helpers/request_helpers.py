from flask import jsonify

# TODO: Better file name?
def bad_request(msg: str):
    return jsonify({"error": msg}), 400


def not_found(msg: str = "Not found"):
    return jsonify({"error": msg}), 404


def ok(payload, status=200):
    return jsonify(payload), status

# TODO: Should be in another file (utils?)
def parse_int(val, name):
    if val is None:
        return None
    try:
        return int(val)
    except (TypeError, ValueError):
        raise ValueError(f"{name} must be an integer")
