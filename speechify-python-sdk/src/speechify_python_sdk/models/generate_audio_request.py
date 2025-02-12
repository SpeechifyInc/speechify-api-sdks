from typing import Literal, Optional
from pydantic import BaseModel


class GenerateAudioRequest(BaseModel):
    """
    Wrap the request parameters to generate an audio for an input text.
    """

    def __init__(
        self,
        input: str,
        voice_id: str,
        audio_format: Optional[Literal["wav", "mp3", "ogg", "aac"]] = None,
        language: Optional[str] = None,
        model: Optional[
            Literal["simba-english", "simba-multilingual", "simba-turbo"]
        ] = None,
        loudness_normalization=Optional[bool],
    ):
        """
        Create the parameters wrapper.

        Args:
          input: Plain text or SSML to be synthesized to speech. Refer to https://docs.sws.speechify.com/docs/api-limits for the input size limits.
          voice_id: Id of the voice to be used for synthesizing speech. Refer to :func:`~speechify_sdk.lib.speechify_voices.SpeechifyVoices.list` for available voices.
          audio_format: The format for the output audio. Note, that the current default is "wav", but there's no guarantee it will not change in the future. We recommend always passing the specific param you expect.
          language: Language of the input. Follow the format of an ISO 639-1 language code and an ISO 3166-1 region code, separated by a hyphen, e.g. en-US. Please refer to the list of the supported languages and recommendations regarding this parameter: https://docs.sws.speechify.com/docs/language-support.
          model: Model used for audio synthesis. Defaults to simba-base. It could be:

                        - simba-base ModelBase ModelBase is deprecated. Use simba-english or simba-multilingual instead. @deprecated
                        - simba-english ModelEnglish
                        - simba-multilingual ModelMultilingual
                        - simba-turbo ModelTurbo

          loudness_normalization: Determines whether to normalize the audio loudness to a standard level. When enabled, loudness normalization aligns the audio output to the following standards:

                        - Integrated loudness: -14 LUFS
                        - True peak: -2 dBTP
                        - Loudness range: 7 LU
                        If disabled, the audio loudness will match the original loudness of the selected voice, which may vary significantly and be either too quiet or too loud. Enabling loudness normalization can increase latency due to additional processing required for audio level adjustments.

        Returns:
          A  new instance of the request model containing all the parameters.
        """
        self.input = input
        self.voice_id = voice_id
        self.audio_format = audio_format
        self.language = language
        self.model = model
        self.loudness_normalization = loudness_normalization
