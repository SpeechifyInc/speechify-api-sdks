from speechify_python_sdk import __about__
from speechify_python_sdk.lib.speechify_audio import SpeechifyTTS
from speechify_python_sdk.lib.speechify_auth import SpeechifyAuth
from speechify_python_sdk.lib.speechify_requests import SpeechifyRequests
from speechify_python_sdk.lib.speechify_voices import SpeechifyVoices


class Speechify:
    """
    This is the facade to Speechify's API. Use this class
    to call interact with Speechify's API.
    """

    def __init__(self, api_key: str):
        """
        This class is designed to be used on server side so it will need
        an API Key to authenticate to Speechify's server.
        """
        self.api_key = api_key

    @property
    def version(self):
        return __about__.__version__

    def set_api_key(self, new_api_key: str):
        """
        Replace the existing api key with a new one.
        """
        if len(new_api_key) <= 0:
            raise ValueError("new api key is invalid")
        self.api_key = new_api_key

    @property
    def voices(self):
        """
        Provide interactions to voices resource.
        """
        return SpeechifyVoices(SpeechifyRequests())

    @property
    def audio(self):
        """
        Provide interactions to audio resource.
        """
        return SpeechifyTTS()

    @property
    def auth(self):
        """
        Provide interactions to OAuth resource.
        """
        return SpeechifyAuth()
