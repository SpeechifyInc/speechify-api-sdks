from requests import HTTPError

from speechify_python_sdk.lib.config import Config
from speechify_python_sdk.speechify import Speechify


def test_version():
    assert "0.0.1" == Speechify(api_key="adsad").version


def test_config():
    assert Config.SPEECHIFY_API_KEY != ""


def test_voices_list_returns_non_empty():
    Config.use_dev()
    s = Speechify(api_key=Config.SPEECHIFY_API_KEY)
    r = s.voices.list()

    assert len(r) > 0
    assert r[0].id != ""
    assert len(r[0].models) > 0
    assert r[0].models[0].name != ""
    assert len(r[0].models[0].languages) > 0
    assert r[0].models[0].languages[0].locale != ""
    assert r[0].models[0].languages[0].preview_audio != ""


def test_voices_list_returns_empty_voices(mocker):
    mocker.patch(
        "speechify_python_sdk.lib.speechify_requests.SpeechifyRequests.fetch_json",
        return_value=[],
    )
    Config.use_dev()
    s = Speechify(api_key=Config.SPEECHIFY_API_KEY)
    r = s.voices.list()

    assert len(r) == 0


def test_voices_list_raises_http_500(mocker):
    mock_response = mocker.MagicMock()
    mock_response.json.return_value = ["asda"]
    mock_response.status_code = 500
    mock_response.raise_for_status = mocker.Mock()

    mock_response.raise_for_status.side_effect = HTTPError(
        "adasd", response=mock_response
    )
    mocker.patch("requests.get", return_value=mock_response)

    Config.use_dev()
    s = Speechify(api_key=Config.SPEECHIFY_API_KEY)
    try:
        s.voices.list()
    except HTTPError as e:
        assert 1 == 1
        assert e.response.status_code == 500
