from typing import Generator

from speechify_python_sdk.models.generate_audio_request import GenerateAudioRequest
from speechify_python_sdk.models.generate_audio_response import GenerateAudioResponse


class SpeechifyTTS:

    def text_to_speech(self, request: GenerateAudioRequest) -> GenerateAudioResponse:
        """
        Gets the speech data for the given input

        Arguments:
            request: The request parameters

        Returns:
            A GenerateAudioResponse

        Raises:
            HTTPError:

                - 400 Invalid request parameters
                - 402 Insufficient credits
                - 403 Access Denied
                - 500 Internal Server Error
        """
        pass

    def stream(self, request: GenerateAudioRequest):
        """
        Gets the stream speech for the given input

        Returns:
            Base64 encoded of the the audio data
        """
        pass
