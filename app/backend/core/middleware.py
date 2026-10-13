class HealthCheckHostMiddleware:
    """
    Normalize the Host header only for the dedicated ALB health endpoint.
    All other requests retain Django's normal host validation.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == "/healthz/" and request.method in ("GET", "HEAD"):
            request.META["HTTP_HOST"] = "localhost"

        return self.get_response(request)
