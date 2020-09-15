import requests
import pytest
import json


class TestApi:
    uris = ["https://production.wazimap-ng.openup.org.za"]
    resources = ["/api/v1/all_details/profile/8/geography/DC1/",
                 "/api/v1/profile/2/points/themes/",
                 "/api/v1/profile/2/points/themes/categories/",
                 "/api/v1/profile/2/points/category/292/points/",
                 "/api/v1/profile/2/points/profile_categories/",
                 "/api/v1/profile/2/points/theme/2/profile_categories/"]

    urls = []
    for uri in uris:
        for resource in resources:
            url = uri + resource
            urls.append(url)

    def getjson(self, filepath):
        with open(filepath) as jsonfile:
            payload = json.load(jsonfile)
        return payload

    @pytest.fixture(params = urls)
    def url(self, request):
        return request.param

    def test_get_status(self, url):
        req = requests.get(url)
        assert req.status_code==200, "{} == not responding".format(url)

    def test_post_status(self, url):
        req = requests.post(url, self.getjson('post_payload.txt'))
        assert req.status_code==405, "{} should not be posting".format(url)

    def test_put_status(self, url):
        req = requests.put(url, self.getjson('post_payload.txt'))
        assert req.status_code==405, "{} should not be put".format(url)
