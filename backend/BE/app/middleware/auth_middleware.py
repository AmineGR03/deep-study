from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # ✅ Let preflight requests through without JWT check
            if request.method == "OPTIONS":
                return jsonify({}), 200
            
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in roles:
                return jsonify({"error": "Acces refuse"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator