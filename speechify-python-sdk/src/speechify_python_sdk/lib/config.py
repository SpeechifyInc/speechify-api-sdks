import os

from speechify_python_sdk import __about__
from speechify_python_sdk.lib.speechify_requests import SpeechifyRequests


class Config:
    SPEECHIFY_API_KEY = os.environ.get("SPEECHIFY_API_KEY", "")

    @classmethod
    def sdk_version(cls):
        return __about__.__version__

    @classmethod
    def __setup_requests_base_config__(cls):
        SpeechifyRequests.api_key = Config.SPEECHIFY_API_KEY
        SpeechifyRequests.sdk_version = Config.sdk_version()

    @classmethod
    def use_prod(cls):
        cls.__setup_requests_base_config__()
        SpeechifyRequests.use_prod()

    @classmethod
    def use_dev(cls):
        cls.__setup_requests_base_config__()
        SpeechifyRequests.use_dev
