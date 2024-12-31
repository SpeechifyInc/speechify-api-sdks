from speechify_python_sdk.models.generate_oauth_token_request import (
    GenerateOAuthTokenRequest,
)


class SpeechifyAuth:
    def generate_oauth_token(self, request: GenerateOAuthTokenRequest):
        """
        Create a new API token for the logged in user

        Arguments:
            request: The request parameters

        Returns:
            A GenerateOAuthTokenResponse
        """
        pass
