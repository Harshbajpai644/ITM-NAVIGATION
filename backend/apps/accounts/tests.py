"""Building API tests live primarily in visitors.tests for shared suite."""
from rest_framework.test import APITestCase


class HealthSmokeTest(APITestCase):
    def test_health(self):
        res = self.client.get("/api/admin/health/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], "ok")