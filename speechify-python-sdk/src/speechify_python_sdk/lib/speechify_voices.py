from typing import List

from speechify_python_sdk.lib.speechify_requests import SpeechifyRequests
from speechify_python_sdk.models.voices_response import VoicesResponse


class SpeechifyVoices:

    def __init__(self, requests: SpeechifyRequests):
        self.requests = requests

    def list(self) -> List[VoicesResponse]:
        """
        Gets the list of voices available for the user

        Returns:
            An empty array if no voices found or
            list of VoicesResponse

        Raises:
            - 500 Internal Server Error

        """
        data = self.requests.fetch_json("/v1/voices")

        return list(
            map(
                lambda item: VoicesResponse.model_validate(item),
                data,
            )
        )

    def create(self):
        """
        Create a personal (cloned) voice for the user

        Raises:
            - 400 Invalid request params
            - 402 Current billing plan does not have access to voice cloning
            - 500 Internal Server Error

        Returns:
            A CreateVoiceResponse

        """
        pass

    def delete(self):
        pass
