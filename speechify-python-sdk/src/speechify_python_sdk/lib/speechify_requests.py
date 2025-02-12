import requests


class SpeechifyRequests:
    """
    Responsible to do all HTTP requests to Speechify REST API
    """

    api_url = "https://api.sws.speechify.com"
    api_key = ""
    sdk_version = ""

    @classmethod
    def use_prod(cls):
        cls.api_url = "https://api.sws.speechify.com"

    @classmethod
    def use_dev(cls):
        cls.api_url = "https://api.sws.speechify.dev"

    @classmethod
    def set_api_key(cls, new_api_key: str):
        cls.api_key = new_api_key

    @classmethod
    def set_config(cls, api_key: str, sdk_version: str, is_use_prod: bool):
        cls.api_key = api_key
        cls.sdk_version = sdk_version
        cls.use_prod() if is_use_prod else cls.use_dev()

    def __get_headers__(self):
        headers = {
            "Authorization": f"Bearer {SpeechifyRequests.api_key}",
            "X-Speechify-SDK": "python",
            "X-Speechify-SDK-Version": SpeechifyRequests.sdk_version,
        }

        return headers

    def fetch_json(self, path: str):
        headers = self.__get_headers__()

        response = requests.get(f"{SpeechifyRequests.api_url}{path}", headers=headers)
        response.raise_for_status()

        return response.json()
